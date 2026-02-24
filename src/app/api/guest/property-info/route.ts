export const dynamic = 'force-dynamic';

import { getDb } from '@/lib/db';
import { getGuestSession } from '@/lib/guest-auth';

export async function GET() {
  const session = await getGuestSession();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sql = getDb();
  const items = await sql`
    SELECT
      id,
      category,
      title,
      content,
      sort_order,
      photo_id
    FROM property_info
    ORDER BY category ASC, sort_order ASC
  `;

  return Response.json(items);
}
