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
    SELECT id, name, description, category, icon, url, distance, sort_order, created_at
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
  const { name, description, category, icon, url, distance } = body;

  if (!name || !description) {
    return Response.json({ error: 'Name and description are required' }, { status: 400 });
  }

  const sql = getDb();

  const [maxResult] = await sql`
    SELECT COALESCE(MAX(sort_order), -1)::int AS max_order FROM favorite_places
  `;
  const nextOrder = (maxResult.max_order as number) + 1;

  const [place] = await sql`
    INSERT INTO favorite_places (name, description, category, icon, url, distance, sort_order)
    VALUES (
      ${name},
      ${description},
      ${category || 'activity'},
      ${icon || ''},
      ${url || null},
      ${distance || null},
      ${nextOrder}
    )
    RETURNING id, name, description, category, icon, url, distance, sort_order, created_at
  `;

  return Response.json(place, { status: 201 });
}
