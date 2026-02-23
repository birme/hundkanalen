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

  const [existing] = await sql`SELECT id FROM checklist_items WHERE id = ${id}`;
  if (!existing) {
    return Response.json({ error: 'Checklist item not found' }, { status: 404 });
  }

  const links = await sql<{ property_info_id: string }[]>`
    SELECT property_info_id
    FROM checklist_property_info
    WHERE checklist_item_id = ${id}
  `;

  return Response.json(links.map((l) => l.property_info_id));
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const session = await requireAdmin();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json();
  const { propertyInfoIds } = body;

  if (!Array.isArray(propertyInfoIds)) {
    return Response.json(
      { error: 'propertyInfoIds must be an array' },
      { status: 400 }
    );
  }

  const sql = getDb();

  const [existing] = await sql`SELECT id FROM checklist_items WHERE id = ${id}`;
  if (!existing) {
    return Response.json({ error: 'Checklist item not found' }, { status: 404 });
  }

  // Delete all existing links, then insert new ones
  await sql`DELETE FROM checklist_property_info WHERE checklist_item_id = ${id}`;

  for (const piId of propertyInfoIds) {
    await sql`
      INSERT INTO checklist_property_info (checklist_item_id, property_info_id)
      VALUES (${id}, ${piId})
      ON CONFLICT DO NOTHING
    `;
  }

  return Response.json({ success: true });
}
