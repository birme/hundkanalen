export const dynamic = 'force-dynamic';

import { getDb } from '@/lib/db';
import { getGuestSession } from '@/lib/guest-auth';

export async function GET() {
  const session = await getGuestSession();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sql = getDb();
  const [stay] = await sql`
    SELECT
      id,
      guest_name,
      guest_email,
      check_in,
      check_out,
      guests,
      total_price,
      currency,
      keybox_code,
      notes,
      status
    FROM stays
    WHERE id = ${session.stayId}
    LIMIT 1
  `;

  if (!stay) {
    return Response.json({ error: 'Stay not found' }, { status: 404 });
  }

  // Only expose keybox_code within the allowed window:
  // from 24 hours before check_in through end of check_out day
  const now = new Date();
  const checkIn = new Date(stay.check_in);
  const checkOut = new Date(stay.check_out);

  const windowStart = new Date(checkIn);
  windowStart.setHours(windowStart.getHours() - 24);

  const windowEnd = new Date(checkOut);
  windowEnd.setHours(23, 59, 59, 999);

  const showKeybox = now >= windowStart && now <= windowEnd;

  return Response.json({
    ...stay,
    keybox_code: showKeybox ? stay.keybox_code : null,
  });
}
