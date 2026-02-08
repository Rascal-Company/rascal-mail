import { jwtVerify } from 'jose';

interface JWTPayload {
  sub: string;
  email: string;
  exp: number;
  iat: number;
}

export async function validateExternalJWT(token: string): Promise<JWTPayload | null> {
  try {
    const secret = new TextEncoder().encode(process.env.RASCAL_AI_JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}
