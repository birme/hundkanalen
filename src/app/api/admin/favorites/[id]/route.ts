export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, context: RouteContext) {
  const session = await requireAdmin();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const sql = getDb();

  const [existing] = await sql`SELECT id FROM favorite_places WHERE id = ${id}`;
  if (!existing) {
    return Response.json({ error: 'Place not found' }, { status: 404 });
  }

  const body = await request.json();
  const updates: Record<string, unknown> = {};

  if (body.name !== undefined) updates.name = body.name;
  if (body.description !== undefined) updates.description = body.description;
  if (body.category !== undefined) updates.category = body.category;
  if (body.icon !== undefined) updates.icon = body.icon;
  if (body.url !== undefined) updates.url = body.url || null;
  if (body.distance !== undefined) updates.distance = body.distance || null;
  if (body.sort_order !== undefined) updates.sort_order = body.sort_order;
  if (body.owner_tips !== undefined) updates.owner_tips = body.owner_tips || null;

  updates.updated_at = new Date();

  if (Object.keys(updates).length <= 1) {
    return Response.json({ error: 'No fields provided for update' }, { status: 400 });
  }

  const [updated] = await sql`
    UPDATE favorite_places
    SET ${sql(updates)}
    WHERE id = ${id}
    RETURNING id, name, description, category, icon, url, distance, sort_order, owner_tips, created_at
  `;

  return Response.json(updated);
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const session = await requireAdmin();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const sql = getDb();

  const [existing] = await sql`SELECT id FROM favorite_places WHERE id = ${id}`;
  if (!existing) {
    return Response.json({ error: 'Place not found' }, { status: 404 });
  }

  await sql`DELETE FROM favorite_places WHERE id = ${id}`;

  return Response.json({ success: true });
}
