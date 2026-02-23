export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { category, orderedIds } = body;

  if (!category || typeof category !== 'string') {
    return Response.json(
      { error: 'category is required' },
      { status: 400 }
    );
  }

  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return Response.json(
      { error: 'orderedIds must be a non-empty array of item IDs' },
      { status: 400 }
    );
  }

  const sql = getDb();

  // Verify all IDs belong to the specified category
  const existing = await sql<{ id: string }[]>`
    SELECT id FROM property_info
    WHERE category = ${category} AND id = ANY(${orderedIds})
  `;
  if (existing.length !== orderedIds.length) {
    return Response.json(
      { error: 'Some item IDs are invalid or do not belong to this category' },
      { status: 400 }
    );
  }

  // Update sort_order for each item
  for (let i = 0; i < orderedIds.length; i++) {
    await sql`
      UPDATE property_info
      SET sort_order = ${i}, updated_at = NOW()
      WHERE id = ${orderedIds[i]}
    `;
  }

  return Response.json({ success: true });
}
