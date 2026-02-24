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
    SELECT id, type, title, description, sort_order, photo_id, created_at, updated_at
    FROM checklist_items
    ORDER BY type ASC, sort_order ASC
  `;

  return Response.json(items);
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { type, title, description, sort_order, photo_id } = body;

  if (!type || !title) {
    return Response.json(
      { error: 'Missing required fields: type, title' },
      { status: 400 }
    );
  }

  if (type !== 'checkin' && type !== 'checkout') {
    return Response.json(
      { error: 'type must be "checkin" or "checkout"' },
      { status: 400 }
    );
  }

  const sql = getDb();
  const [item] = await sql`
    INSERT INTO checklist_items (type, title, description, sort_order, photo_id)
    VALUES (
      ${type},
      ${title},
      ${description ?? null},
      ${sort_order ?? 0},
      ${photo_id ?? null}
    )
    RETURNING id, type, title, description, sort_order, photo_id, created_at, updated_at
  `;

  return Response.json(item, { status: 201 });
}
