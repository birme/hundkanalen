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

  const [existing] = await sql`SELECT id FROM checklist_items WHERE id = ${id}`;
  if (!existing) {
    return Response.json({ error: 'Checklist item not found' }, { status: 404 });
  }

  const body = await request.json();
  const { title, description, sort_order, type } = body;

  const updates: Record<string, unknown> = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (sort_order !== undefined) updates.sort_order = sort_order;
  if (type !== undefined) {
    if (type !== 'checkin' && type !== 'checkout') {
      return Response.json(
        { error: 'type must be "checkin" or "checkout"' },
        { status: 400 }
      );
    }
    updates.type = type;
  }

  if (Object.keys(updates).length === 0) {
    return Response.json({ error: 'No fields provided for update' }, { status: 400 });
  }

  const [updated] = await sql`
    UPDATE checklist_items
    SET ${sql(updates)}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING id, type, title, description, sort_order, created_at, updated_at
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

  const [existing] = await sql`SELECT id FROM checklist_items WHERE id = ${id}`;
  if (!existing) {
    return Response.json({ error: 'Checklist item not found' }, { status: 404 });
  }

  await sql`DELETE FROM checklist_items WHERE id = ${id}`;

  return Response.json({ success: true });
}
