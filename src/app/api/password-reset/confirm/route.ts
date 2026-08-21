export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { hash } from 'bcryptjs';
import { getDb } from '@/lib/db';
import {
  ensurePasswordResetTable,
  hashPasswordResetToken,
} from '@/lib/admin-password-reset';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const token = typeof body.token === 'string' ? body.token.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!token || !password) {
    return Response.json({ error: 'Token and password are required' }, { status: 400 });
  }

  if (password.length < 8) {
    return Response.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
  }

  await ensurePasswordResetTable();
  const sql = getDb();
  const tokenHash = hashPasswordResetToken(token);

  const [reset] = await sql`
    SELECT id, user_id
    FROM admin_password_reset_tokens
    WHERE token_hash = ${tokenHash}
      AND used_at IS NULL
      AND expires_at > NOW()
  `;

  if (!reset) {
    return Response.json({ error: 'The reset link is invalid or has expired' }, { status: 400 });
  }

  const passwordHash = await hash(password, 12);

  await sql`
    UPDATE users
    SET password_hash = ${passwordHash},
        updated_at = NOW()
    WHERE id = ${reset.user_id}
      AND role = 'admin'
  `;

  await sql`
    UPDATE admin_password_reset_tokens
    SET used_at = NOW()
    WHERE id = ${reset.id}
  `;

  return Response.json({ success: true });
}
