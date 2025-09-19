
import { ProviderDAL } from '../dal/providerDAL.js';
import bcrypt from 'bcryptjs';

export class ProviderService {
  static async registerProvider(providerData) {
    const { 
      name, 
      email, 
      mobile, 
      password, 
      alternate_mobile, 
      address, 
      cityId, 
      stateId, 
      zipcode 
    } = providerData;

    // Validate required fields
    if (!name || !email || !mobile || !password || !address || !cityId || !stateId || !zipcode) {
      throw new Error('All required fields must be provided');
    }

    // Check if email already exists
    const existingEmailUser = await ProviderDAL.findByEmail(email);
    if (existingEmailUser) {
      throw new Error('Email or Mobile already exists. Try with different email or mobile');
    }

    // Check if mobile already exists
    const existingMobileUser = await ProviderDAL.findByMobile(mobile);
    if (existingMobileUser) {
      throw new Error('Email or Mobile already exists. Try with different email or mobile');
    }

    // Check if alternate mobile exists (if provided)
    if (alternate_mobile) {
      const existingAlternateMobile = await ProviderDAL.findByAlternateMobile(alternate_mobile);
      if (existingAlternateMobile) {
        throw new Error('Email or Mobile already exists. Try with different email or mobile');
      }
    }

    // Verify city and state exist
    const city = await ProviderDAL.findCityById(cityId);
    if (!city) {
      throw new Error('Invalid city selected');
    }

    if (city.stateId !== stateId) {
      throw new Error('City does not belong to the selected state');
    }

    const state = await ProviderDAL.findStateById(stateId);
    if (!state) {
      throw new Error('Invalid state selected');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create provider with pending status
    const newProvider = await ProviderDAL.createProvider({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      mobile: mobile.trim(),
      password: hashedPassword,
      alternate_mobile: alternate_mobile?.trim() || null,
      address: address.trim(),
      cityId,
      stateId,
      zipcode: zipcode.trim(),
      role_id: 'provider',
      registration_status: 'pending',
      is_active: false,
      email_verified: false,
      mobile_verified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return newProvider;
  }
}
