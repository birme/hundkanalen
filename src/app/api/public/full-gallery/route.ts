export const dynamic = 'force-dynamic';

import { getDb } from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const accessCookie = cookieStore.get('hk-site-access');

  if (accessCookie?.value !== 'verified') {
    return Response.json({ error: 'Access code required' }, { status: 401 });
  }

  const sql = getDb();
  const photos = await sql`
    SELECT id, filename, caption, category, sort_order
    FROM photos
    ORDER BY sort_order ASC, created_at ASC
  `;

  return Response.json(photos);
}
