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
  const settings = await sql`SELECT key, value FROM site_settings ORDER BY key`;

  const result: Record<string, string> = {};
  for (const row of settings) {
    result[row.key as string] = row.value as string;
  }

  return Response.json(result);
}

export async function PUT(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { key, value } = body;

  if (!key || typeof value !== 'string') {
    return Response.json({ error: 'Key and value are required' }, { status: 400 });
  }

  const sql = getDb();
  await sql`
    INSERT INTO site_settings (key, value, updated_at)
    VALUES (${key}, ${value}, NOW())
    ON CONFLICT (key) DO UPDATE SET value = ${value}, updated_at = NOW()
  `;

  return Response.json({ success: true });
}
