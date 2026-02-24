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
      ci.id,
      ci.type,
      ci.title,
      ci.description,
      ci.sort_order,
      ci.photo_id,
      COALESCE(json_agg(json_build_object('id', pi.id, 'title', pi.title, 'content', pi.content))
        FILTER (WHERE pi.id IS NOT NULL), '[]'::json) AS linked_info
    FROM checklist_items ci
    LEFT JOIN checklist_property_info cpi ON cpi.checklist_item_id = ci.id
    LEFT JOIN property_info pi ON pi.id = cpi.property_info_id
    GROUP BY ci.id, ci.type, ci.title, ci.description, ci.sort_order, ci.photo_id
    ORDER BY ci.sort_order ASC
  `;

  return Response.json(items);
}
