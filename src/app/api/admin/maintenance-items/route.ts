export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

const PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;
const STATUSES = ['planned', 'in_progress', 'done', 'deferred'] as const;

function nullableInteger(value: unknown) {
  if (value === '' || value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(number) : null;
}

function nullableText(value: unknown) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function nullableDate(value: unknown) {
  if (typeof value !== 'string' || value.trim().length === 0) return null;
  return value;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sql = getDb();
  const items = await sql`
    SELECT
      id, title, area, description, source, priority, status, target_year,
      estimated_cost, actual_cost, completed_at, sort_order, created_at, updated_at
    FROM maintenance_items
    ORDER BY
      CASE status
        WHEN 'in_progress' THEN 0
        WHEN 'planned' THEN 1
        WHEN 'deferred' THEN 2
        WHEN 'done' THEN 3
        ELSE 4
      END,
      target_year NULLS LAST,
      sort_order ASC,
      created_at ASC
  `;

  return Response.json(items);
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const title = nullableText(body.title);
  const area = nullableText(body.area) ?? 'general';
  const priority = PRIORITIES.includes(body.priority) ? body.priority : 'medium';
  const status = STATUSES.includes(body.status) ? body.status : 'planned';

  if (!title) {
    return Response.json({ error: 'Missing required field: title' }, { status: 400 });
  }

  const sql = getDb();
  const [item] = await sql`
    INSERT INTO maintenance_items (
      title, area, description, source, priority, status, target_year,
      estimated_cost, actual_cost, completed_at, sort_order
    )
    VALUES (
      ${title},
      ${area},
      ${nullableText(body.description)},
      ${nullableText(body.source)},
      ${priority},
      ${status},
      ${nullableInteger(body.target_year)},
      ${nullableInteger(body.estimated_cost)},
      ${nullableInteger(body.actual_cost)},
      ${nullableDate(body.completed_at)},
      ${nullableInteger(body.sort_order) ?? 0}
    )
    RETURNING
      id, title, area, description, source, priority, status, target_year,
      estimated_cost, actual_cost, completed_at, sort_order, created_at, updated_at
  `;

  return Response.json(item, { status: 201 });
}
