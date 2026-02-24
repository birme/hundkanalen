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
  const items = await sql`
    SELECT id, title, content, category, sort_order, photo_id, created_at, updated_at
    FROM property_info
    ORDER BY category ASC, sort_order ASC
  `;

  return Response.json(items);
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { title, content, category, sort_order, photo_id } = body;

  if (!title || !content || !category) {
    return Response.json(
      { error: 'Missing required fields: title, content, category' },
      { status: 400 }
    );
  }

  const sql = getDb();
  const [item] = await sql`
    INSERT INTO property_info (title, content, category, sort_order, photo_id)
    VALUES (
      ${title},
      ${content},
      ${category},
      ${sort_order ?? 0},
      ${photo_id ?? null}
    )
    RETURNING id, title, content, category, sort_order, photo_id, created_at, updated_at
  `;

  return Response.json(item, { status: 201 });
}
