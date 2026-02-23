export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import { hash } from 'bcryptjs';

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sql = getDb();
  const users = await sql`
    SELECT id, email, name, role, created_at
    FROM users
    WHERE role = 'admin'
    ORDER BY created_at ASC
  `;

  return Response.json(users);
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { name, email, password } = body;

  if (!name || !email || !password) {
    return Response.json(
      { error: 'Missing required fields: name, email, password' },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return Response.json(
      { error: 'Password must be at least 8 characters' },
      { status: 400 }
    );
  }

  const sql = getDb();

  const [existing] = await sql`SELECT id FROM users WHERE email = ${email}`;
  if (existing) {
    return Response.json(
      { error: 'A user with this email already exists' },
      { status: 409 }
    );
  }

  const passwordHash = await hash(password, 12);

  const [user] = await sql`
    INSERT INTO users (name, email, password_hash, role)
    VALUES (${name}, ${email}, ${passwordHash}, 'admin')
    RETURNING id, email, name, role, created_at
  `;

  return Response.json(user, { status: 201 });
}
