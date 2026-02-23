export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const accessCookie = cookieStore.get('hk-site-access');

  return Response.json({ verified: accessCookie?.value === 'verified' });
}
