
import { UserDAL } from '../dal/userDAL.js';
import bcrypt from 'bcryptjs';

export class UserService {
  static async getUsers(options = {}) {
    const { skip, take, sortField, sortOrder, filters } = options;

    // Build where clause for filtering
    const where = {};
    if (filters.name) {
      where.name = { contains: filters.name, mode: 'insensitive' };
    }
    if (filters.username) {
      where.username = { contains: filters.username, mode: 'insensitive' };
    }
    if (filters.email) {
      where.email = { contains: filters.email, mode: 'insensitive' };
    }
    if (filters.role_id) {
      where.role_id = { contains: filters.role_id, mode: 'insensitive' };
    }

    // Build orderBy clause
    const orderBy = {};
    if (sortField) {
      orderBy[sortField] = sortOrder === 1 ? 'asc' : 'desc';
    }

    return await UserDAL.findMany({
      skip,
      take,
      where,
      orderBy,
    });
  }

  static async createUser(userData) {
    const { username, email, password, name, role } = userData;

    // Validation
    if (!username || !email || !password || !name || !role) {
      throw new Error('All fields are required');
    }

    // Check if user already exists
    const existingUserByEmail = await UserDAL.findByEmail(email);
    if (existingUserByEmail) {
      throw new Error('User with this email already exists');
    }

    const existingUserByUsername = await UserDAL.findByUsername(username);
    if (existingUserByUsername) {
      throw new Error('User with this username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    return await UserDAL.create({
      username,
      email,
      password: hashedPassword,
      name,
      role_id: role,
      is_active: true,
    });
  }

  static async updateUser(id, userData) {
    const { username, email, name, role, password } = userData;

    // Check if user exists
    const existingUser = await UserDAL.findById(id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    // Check for duplicate email/username (excluding current user)
    if (email && email !== existingUser.email) {
      const userWithEmail = await UserDAL.findByEmail(email);
      if (userWithEmail && userWithEmail.id !== id) {
        throw new Error('User with this email already exists');
      }
    }

    if (username && username !== existingUser.username) {
      const userWithUsername = await UserDAL.findByUsername(username);
      if (userWithUsername && userWithUsername.id !== id) {
        throw new Error('User with this username already exists');
      }
    }

    // Prepare update data
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (name) updateData.name = name;
    if (role) updateData.role_id = role;
    
    // Hash password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    return await UserDAL.update(id, updateData);
  }

  static async deleteUser(id) {
    const existingUser = await UserDAL.findById(id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    return await UserDAL.delete(id);
  }

  static async getProviders(options = {}) {
    return await UserDAL.findProviders(options);
  }
}
