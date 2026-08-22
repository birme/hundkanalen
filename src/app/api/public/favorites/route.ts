export const dynamic = 'force-dynamic';

import { getDb } from '@/lib/db';

export async function GET() {
  const sql = getDb();
  const places = await sql`
    SELECT id, name, name_sv, description, description_sv, category, icon, url, distance, sort_order, owner_tips, owner_tips_sv
    FROM favorite_places
    ORDER BY sort_order ASC, created_at ASC
  `;

  return Response.json(places);
}
