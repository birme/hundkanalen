export const dynamic = 'force-dynamic';

import { getDb } from '@/lib/db';
import { cookies } from 'next/headers';
import { getGuestSession } from '@/lib/guest-auth';

export async function GET() {
  const cookieStore = await cookies();
  const accessCookie = cookieStore.get('hk-site-access');
  const guestSession = await getGuestSession();

  // Allow access via global access code OR valid stay session
  if (accessCookie?.value !== 'verified' && !guestSession) {
    return Response.json({ error: 'Access code required' }, { status: 401 });
  }

  const sql = getDb();
  const photos = await sql`
    SELECT id, filename, caption, category, sort_order
    FROM photos
    WHERE id NOT IN (SELECT photo_id FROM checklist_items WHERE photo_id IS NOT NULL)
      AND id NOT IN (SELECT photo_id FROM property_info WHERE photo_id IS NOT NULL)
    ORDER BY sort_order ASC, created_at ASC
  `;

  return Response.json(photos);
}
