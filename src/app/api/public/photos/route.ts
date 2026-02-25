export const dynamic = 'force-dynamic';

import { getDb } from '@/lib/db';

export async function GET() {
  const sql = getDb();
  const photos = await sql`
    SELECT id, filename, caption, category, sort_order
    FROM photos
    WHERE is_public = true
      AND id NOT IN (SELECT photo_id FROM checklist_items WHERE photo_id IS NOT NULL)
      AND id NOT IN (SELECT photo_id FROM property_info WHERE photo_id IS NOT NULL)
    ORDER BY sort_order ASC, created_at ASC
  `;

  return Response.json(photos);
}
