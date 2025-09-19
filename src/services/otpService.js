
import { PrismaClient } from '../../generated/prisma-client';

const prisma = new PrismaClient();

export class OTPService {
  static async validateMobileOTP(mobile, otp, roleId) {
    // Find user by mobile number and role
    const user = await prisma.user.findFirst({
      where: { 
        mobile: mobile.trim(),
        role_id: roleId
      }
    });

    if (!user) {
      throw new Error('Mobile number not found');
    }

    // Find valid OTP
    const otpRecord = await prisma.otp.findFirst({
      where: {
        mobile: mobile.trim(),
        otp: otp.trim(),
        type: 'mobile',
        is_used: false,
        expires_at: {
          gte: new Date()
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    if (!otpRecord) {
      throw new Error('Invalid OTP');
    }

    // Mark OTP as used and update user
    await Promise.all([
      prisma.otp.update({
        where: { id: otpRecord.id },
        data: { 
          is_used: true,
          verified_at: new Date()
        }
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { 
          mobile_verified: true,
          updated_at: new Date()
        }
      })
    ]);

    return user;
  }

  static async validateEmailOTP(email, otp, roleId) {
    // Find user by email and role
    const user = await prisma.user.findFirst({
      where: { 
        email: email.toLowerCase().trim(),
        role_id: roleId
      }
    });

    if (!user) {
      throw new Error('Email not found');
    }

    // Find valid OTP
    const otpRecord = await prisma.otp.findFirst({
      where: {
        email: email.toLowerCase().trim(),
        otp: otp.trim(),
        type: 'email',
        is_used: false,
        expires_at: {
          gte: new Date()
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    if (!otpRecord) {
      throw new Error('Invalid OTP');
    }

    // Mark OTP as used and update user status
    await prisma.otp.update({
      where: { id: otpRecord.id },
      data: { 
        is_used: true,
        verified_at: new Date()
      }
    });

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { 
        email_verified: true,
        registration_status: 'pending_approval',
        updated_at: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        role_id: true,
        registration_status: true,
        is_active: true
      }
    });

    return updatedUser;
  }
}
