export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const session = await requireAdmin();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const sql = getDb();

  // Verify stay exists
  const [stay] = await sql`SELECT id FROM stays WHERE id = ${id}`;
  if (!stay) {
    return Response.json({ error: 'Stay not found' }, { status: 404 });
  }

  const rows = await sql`
    SELECT favorite_id FROM stay_favorites WHERE stay_id = ${id}
  `;

  return Response.json(rows.map((r) => r.favorite_id));
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const session = await requireAdmin();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const sql = getDb();

  // Verify stay exists
  const [stay] = await sql`SELECT id FROM stays WHERE id = ${id}`;
  if (!stay) {
    return Response.json({ error: 'Stay not found' }, { status: 404 });
  }

  const body = await request.json();
  const { favorite_ids } = body;

  if (!Array.isArray(favorite_ids)) {
    return Response.json({ error: 'favorite_ids must be an array' }, { status: 400 });
  }

  // Replace all stay favorites: delete existing, then insert new
  await sql`DELETE FROM stay_favorites WHERE stay_id = ${id}`;

  if (favorite_ids.length > 0) {
    const rows = favorite_ids.map((fid: string) => ({
      stay_id: id,
      favorite_id: fid,
    }));
    await sql`INSERT INTO stay_favorites ${sql(rows)}`;
  }

  return Response.json({ success: true, favorite_ids });
}
