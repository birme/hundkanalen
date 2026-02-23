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
      type,
      title,
      description,
      sort_order
    FROM checklist_items
    ORDER BY sort_order ASC
  `;

  return Response.json(items);
}
