export const dynamic = 'force-dynamic';

import { getDb } from '@/lib/db';

export async function GET() {
  const sql = getDb();
  const photos = await sql`
    SELECT id, filename, caption, category, sort_order
    FROM photos
    WHERE is_public = true
    ORDER BY sort_order ASC, created_at ASC
  `;

  return Response.json(photos);
}
