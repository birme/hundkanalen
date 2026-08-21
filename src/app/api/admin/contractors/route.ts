export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import { ensureContractorAccessTables } from '@/lib/contractor-access';

function nullableText(value: unknown) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await ensureContractorAccessTables();
  const sql = getDb();
  const contractors = await sql`
    SELECT
      c.id, c.name, c.email, c.phone, c.notes, c.created_at, c.updated_at,
      COALESCE(
        json_agg(
          json_build_object(
            'id', l.id,
            'valid_from', l.valid_from,
            'valid_until', l.valid_until,
            'sent_at', l.sent_at,
            'created_at', l.created_at
          )
          ORDER BY l.created_at DESC
        ) FILTER (WHERE l.id IS NOT NULL),
        '[]'::json
      ) AS access_links
    FROM contractors c
    LEFT JOIN contractor_access_links l ON l.contractor_id = c.id
    GROUP BY c.id
    ORDER BY c.name ASC
  `;

  return Response.json(contractors);
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const name = nullableText(body.name);
  const email = nullableText(body.email)?.toLowerCase();

  if (!name || !email) {
    return Response.json({ error: 'Name and email are required' }, { status: 400 });
  }

  await ensureContractorAccessTables();
  const sql = getDb();
  const [contractor] = await sql`
    INSERT INTO contractors (name, email, phone, notes)
    VALUES (${name}, ${email}, ${nullableText(body.phone)}, ${nullableText(body.notes)})
    RETURNING id, name, email, phone, notes, created_at, updated_at
  `;

  return Response.json({ ...contractor, access_links: [] }, { status: 201 });
}
