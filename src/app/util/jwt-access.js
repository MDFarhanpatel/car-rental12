import { SignJWT, jwtVerify } from 'jose';

const secretKey = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-at-least-32-characters-long'
);

export async function generateToken(payload) {
  try {
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secretKey);
    
    return token;
  } catch (error) {
    console.error('Token generation error:', error);
    throw new Error('Failed to generate token');
  }
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload;
  } catch (error) {
    console.error('Token verification error:', error);
    throw new Error('Invalid token');
  }
}
