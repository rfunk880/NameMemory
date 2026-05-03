import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const secret = () =>
  new TextEncoder().encode(process.env.JWT_SECRET ?? 'change-me-in-production-32chars!!');

const COOKIE = 'auth-token';
const EXPIRY = '30d';

export interface JWTPayload {
  userId: number;
  email: string;
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(secret());
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return { userId: payload.userId as number, email: payload.email as string };
  } catch {
    return null;
  }
}

export async function getAuthUser(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getAuthUserFromRequest(request: NextRequest): Promise<JWTPayload | null> {
  const token = request.cookies.get(COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function cookieOptions() {
  return {
    name: COOKIE,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  };
}
