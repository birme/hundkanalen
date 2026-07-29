export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

type RouteContext = { params: Promise<{ id: string }> };

const PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;
const STATUSES = ['planned', 'in_progress', 'done', 'deferred'] as const;

function nullableInteger(value: unknown) {
  if (value === '' || value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(number) : null;
}

function nullableText(value: unknown) {
  if (value === null) return null;
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function nullableDate(value: unknown) {
  if (value === null) return null;
  if (typeof value !== 'string') return undefined;
  return value.trim().length > 0 ? value : null;
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const session = await requireAdmin();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const sql = getDb();

  const [existing] = await sql`SELECT id FROM maintenance_items WHERE id = ${id}`;
  if (!existing) {
    return Response.json({ error: 'Maintenance item not found' }, { status: 404 });
  }

  const body = await request.json();
  const updates: Record<string, unknown> = {};

  if (body.title !== undefined) {
    const title = nullableText(body.title);
    if (!title) return Response.json({ error: 'Title is required' }, { status: 400 });
    updates.title = title;
  }
  if (body.area !== undefined) updates.area = nullableText(body.area) ?? 'general';
  if (body.description !== undefined) updates.description = nullableText(body.description) ?? null;
  if (body.source !== undefined) updates.source = nullableText(body.source) ?? null;
  if (body.priority !== undefined && PRIORITIES.includes(body.priority)) updates.priority = body.priority;
  if (body.status !== undefined && STATUSES.includes(body.status)) updates.status = body.status;
  if (body.target_year !== undefined) updates.target_year = nullableInteger(body.target_year);
  if (body.estimated_cost !== undefined) updates.estimated_cost = nullableInteger(body.estimated_cost);
  if (body.actual_cost !== undefined) updates.actual_cost = nullableInteger(body.actual_cost);
  if (body.completed_at !== undefined) updates.completed_at = nullableDate(body.completed_at) ?? null;
  if (body.sort_order !== undefined) updates.sort_order = nullableInteger(body.sort_order) ?? 0;

  if (Object.keys(updates).length === 0) {
    return Response.json({ error: 'No valid fields provided for update' }, { status: 400 });
  }

  const [updated] = await sql`
    UPDATE maintenance_items
    SET ${sql(updates)}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING
      id, title, area, description, source, priority, status, target_year,
      estimated_cost, actual_cost, completed_at, sort_order, created_at, updated_at
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

  const [existing] = await sql`SELECT id FROM maintenance_items WHERE id = ${id}`;
  if (!existing) {
    return Response.json({ error: 'Maintenance item not found' }, { status: 404 });
  }

  await sql`DELETE FROM maintenance_items WHERE id = ${id}`;

  return Response.json({ success: true });
}
