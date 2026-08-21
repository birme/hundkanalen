export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import { ensureContractorAccessTables } from '@/lib/contractor-access';

type RouteContext = { params: Promise<{ id: string }> };

function nullableText(value: unknown) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const session = await requireAdmin();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const name = nullableText(body.name);
  const email = nullableText(body.email)?.toLowerCase();

  if (!name || !email) {
    return Response.json({ error: 'Name and email are required' }, { status: 400 });
  }

  await ensureContractorAccessTables();
  const sql = getDb();
  const [contractor] = await sql`
    UPDATE contractors
    SET name = ${name},
        email = ${email},
        phone = ${nullableText(body.phone)},
        notes = ${nullableText(body.notes)},
        updated_at = NOW()
    WHERE id = ${id}
    RETURNING id, name, email, phone, notes, created_at, updated_at
  `;

  if (!contractor) {
    return Response.json({ error: 'Contractor not found' }, { status: 404 });
  }

  return Response.json(contractor);
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const session = await requireAdmin();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  await ensureContractorAccessTables();
  const sql = getDb();
  const [contractor] = await sql`
    DELETE FROM contractors
    WHERE id = ${id}
    RETURNING id
  `;

  if (!contractor) {
    return Response.json({ error: 'Contractor not found' }, { status: 404 });
  }

  return Response.json({ success: true });
}
