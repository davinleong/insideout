import crypto from 'crypto';

const header = {
  alg: 'HS256',
  typ: 'JWT'
};

const base64Encode = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');

const createSignature = (header, payload, secret) => {
  const data = `${header}.${payload}`;
  return crypto.createHmac('sha256', secret).update(data).digest('base64url');
};

export default class TokenHandler {
  static generateToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      exp: Math.floor(Date.now() / 1000) + (60 * 60), // Expiration time in seconds (1 hour from now)
    };

    const encodedHeader = base64Encode(header);
    const encodedPayload = base64Encode(payload);
    const secret = process.env.JWT_SECRET; // Replace with your secret key
    const signature = createSignature(encodedHeader, encodedPayload, secret);

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  static verifyToken(token) {
    const [encodedHeader, encodedPayload, signature] = token.split('.');
    const secret = process.env.JWT_SECRET; // Replace with your secret key

    if (signature !== createSignature(encodedHeader, encodedPayload, secret)) {
      throw new Error('Invalid token');
    }

    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString());
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      throw new Error('Token expired');
    }

    return payload;
  }
}