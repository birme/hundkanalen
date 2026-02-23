import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'hundkanalen-guest-session';

export async function createGuestSession(stayId: string, guestName: string, checkOut: Date) {
  const secret = new TextEncoder().encode(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET);
  const exp = new Date(checkOut);
  exp.setDate(exp.getDate() + 7);

  const token = await new SignJWT({ stayId, guestName })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(exp.getTime() / 1000))
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: exp,
  });

  return token;
}

export async function getGuestSession(): Promise<{ stayId: string; guestName: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return { stayId: payload.stayId as string, guestName: payload.guestName as string };
  } catch {
    return null;
  }
}

export async function clearGuestSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
