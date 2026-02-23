export const dynamic = 'force-dynamic';

import { getDb } from '@/lib/db';

export async function GET() {
  const sql = getDb();
  const places = await sql`
    SELECT id, name, description, category, icon, url, distance, sort_order, owner_tips
    FROM favorite_places
    ORDER BY sort_order ASC, created_at ASC
  `;

  return Response.json(places);
}
