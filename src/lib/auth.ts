import { createHmac, randomInt, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

const COOKIE = 'dd_session';
const SESSION_DAYS = 7;

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error('SESSION_SECRET must be set (32+ characters)');
  return s;
}

// ---------- OTP ----------
export function generateOtp() {
  return randomInt(100000, 1000000).toString(); // 6 digits
}

export function hashOtp(userId: number, code: string) {
  // Keyed hash: a 6-digit code can't be reversed from the database
  return createHmac('sha256', secret()).update(`${userId}:${code}`).digest('hex');
}

export function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

// ---------- Session (signed JWT in an HTTP-only cookie) ----------
const key = () => new TextEncoder().encode(secret());

export async function createSession(userId: number) {
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(userId))
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(key());

  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function getSession(): Promise<{ userId: number } | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ['HS256'] });
    const userId = Number(payload.sub);
    return Number.isInteger(userId) && userId > 0 ? { userId } : null;
  } catch {
    return null; // expired or tampered
  }
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}