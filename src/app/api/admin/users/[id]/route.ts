export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const session = await requireAdmin();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;

  // Prevent self-deletion
  if (session.user.id === id) {
    return Response.json(
      { error: 'Cannot delete yourself' },
      { status: 400 }
    );
  }

  const sql = getDb();

  const [existing] = await sql`SELECT id, role FROM users WHERE id = ${id}`;
  if (!existing) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }

  if (existing.role !== 'admin') {
    return Response.json({ error: 'User is not an admin' }, { status: 400 });
  }

  await sql`DELETE FROM users WHERE id = ${id}`;

  return Response.json({ success: true });
}
