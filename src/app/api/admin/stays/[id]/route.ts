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

  const sql = getDb();
  const { id } = await context.params;

  const [stay] = await sql`
    SELECT * FROM stays WHERE id = ${id}
  `;

  if (!stay) {
    return Response.json({ error: 'Stay not found' }, { status: 404 });
  }

  return Response.json(stay);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const session = await requireAdmin();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sql = getDb();
  const { id } = await context.params;

  const [existing] = await sql`SELECT id FROM stays WHERE id = ${id}`;
  if (!existing) {
    return Response.json({ error: 'Stay not found' }, { status: 404 });
  }

  const body = await request.json();
  const {
    guest_name,
    guest_email,
    check_in,
    check_out,
    guests,
    total_price,
    keybox_code,
    notes,
    status,
  } = body;

  // Build update only with provided fields
  const updates: Record<string, unknown> = {};
  if (guest_name !== undefined) updates.guest_name = guest_name;
  if (guest_email !== undefined) updates.guest_email = guest_email;
  if (check_in !== undefined) updates.check_in = check_in;
  if (check_out !== undefined) updates.check_out = check_out;
  if (guests !== undefined) updates.guests = guests;
  if (total_price !== undefined) updates.total_price = total_price;
  if (keybox_code !== undefined) updates.keybox_code = keybox_code;
  if (notes !== undefined) updates.notes = notes;
  if (status !== undefined) updates.status = status;

  if (Object.keys(updates).length === 0) {
    return Response.json({ error: 'No fields provided for update' }, { status: 400 });
  }

  // postgres.js supports dynamic updates via sql() helper
  const [updatedStay] = await sql`
    UPDATE stays
    SET ${sql(updates)}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;

  return Response.json(updatedStay);
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const session = await requireAdmin();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sql = getDb();
  const { id } = await context.params;

  const [existing] = await sql`SELECT id FROM stays WHERE id = ${id}`;
  if (!existing) {
    return Response.json({ error: 'Stay not found' }, { status: 404 });
  }

  await sql`
    UPDATE stays
    SET status = 'cancelled', updated_at = NOW()
    WHERE id = ${id}
  `;

  return Response.json({ success: true });
}
