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

  const [existing] = await sql`SELECT id FROM photos WHERE id = ${id}`;
  if (!existing) {
    return Response.json({ error: 'Photo not found' }, { status: 404 });
  }

  const body = await request.json();
  const { caption, category, sort_order } = body;

  const updates: Record<string, unknown> = {};
  if (caption !== undefined) updates.caption = caption;
  if (category !== undefined) updates.category = category;
  if (sort_order !== undefined) updates.sort_order = sort_order;

  if (Object.keys(updates).length === 0) {
    return Response.json({ error: 'No fields provided for update' }, { status: 400 });
  }

  const [updated] = await sql`
    UPDATE photos
    SET ${sql(updates)}
    WHERE id = ${id}
    RETURNING id, filename, caption, category, sort_order, storage_url, created_at
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

  const [existing] = await sql`SELECT id FROM photos WHERE id = ${id}`;
  if (!existing) {
    return Response.json({ error: 'Photo not found' }, { status: 404 });
  }

  await sql`DELETE FROM photos WHERE id = ${id}`;

  return Response.json({ success: true });
}
