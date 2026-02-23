export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers';
import { getGuestSession } from '@/lib/guest-auth';

export async function GET() {
  const cookieStore = await cookies();
  const accessCookie = cookieStore.get('hk-site-access');

  if (accessCookie?.value === 'verified') {
    return Response.json({ verified: true });
  }

  // Guests with a valid stay session also get full access
  const guestSession = await getGuestSession();
  if (guestSession) {
    return Response.json({ verified: true });
  }

  return Response.json({ verified: false });
}
