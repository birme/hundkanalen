export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sql = getDb();
  const places = await sql`
    SELECT id, name, name_sv, description, description_sv, category, icon, url, distance, sort_order, owner_tips, owner_tips_sv, created_at
    FROM favorite_places
    ORDER BY sort_order ASC, created_at ASC
  `;

  return Response.json(places);
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { name, name_sv, description, description_sv, category, icon, url, distance, owner_tips, owner_tips_sv } = body;

  if (!name || !description) {
    return Response.json({ error: 'Name and description are required' }, { status: 400 });
  }

  const sql = getDb();

  const [maxResult] = await sql`
    SELECT COALESCE(MAX(sort_order), -1)::int AS max_order FROM favorite_places
  `;
  const nextOrder = (maxResult.max_order as number) + 1;

  const [place] = await sql`
    INSERT INTO favorite_places (name, name_sv, description, description_sv, category, icon, url, distance, sort_order, owner_tips, owner_tips_sv)
    VALUES (
      ${name},
      ${name_sv || name},
      ${description},
      ${description_sv || description},
      ${category || 'activity'},
      ${icon || ''},
      ${url || null},
      ${distance || null},
      ${nextOrder},
      ${owner_tips || null},
      ${owner_tips_sv || owner_tips || null}
    )
    RETURNING id, name, name_sv, description, description_sv, category, icon, url, distance, sort_order, owner_tips, owner_tips_sv, created_at
  `;

  return Response.json(place, { status: 201 });
}
