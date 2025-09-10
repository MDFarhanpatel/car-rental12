import { SignJWT, jwtVerify } from 'jose';

// Convert secret to Uint8Array
const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-here');

// Generate JWT token
export async function generateToken(payload) {
  try {
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secret);
    
    return token;
  } catch (error) {
    console.error('Token generation error:', error);
    throw new Error('Failed to generate token');
  }
}

// Verify JWT token
export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    console.error('Token verification error:', error);
    throw new Error('Invalid token');
  }
}
