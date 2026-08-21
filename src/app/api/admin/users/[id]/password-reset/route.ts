export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import { sendAdminPasswordResetEmail } from '@/lib/email';
import {
  PASSWORD_RESET_EXPIRY_MINUTES,
  createPasswordResetToken,
  ensurePasswordResetTable,
} from '@/lib/admin-password-reset';
import { getPublicAppUrl } from '@/lib/public-url';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  const session = await requireAdmin();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;

  if (session.user.id === id) {
    return Response.json(
      { error: 'Cannot reset your own password from this admin action' },
      { status: 400 }
    );
  }

  await ensurePasswordResetTable();
  const sql = getDb();
  const [user] = await sql`
    SELECT id, email, name, role
    FROM users
    WHERE id = ${id}
  `;

  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }

  if (user.role !== 'admin') {
    return Response.json({ error: 'User is not an admin' }, { status: 400 });
  }

  const { token, tokenHash } = createPasswordResetToken();
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_EXPIRY_MINUTES * 60 * 1000);

  await sql`
    UPDATE admin_password_reset_tokens
    SET used_at = NOW()
    WHERE user_id = ${user.id}
      AND used_at IS NULL
  `;

  await sql`
    INSERT INTO admin_password_reset_tokens (user_id, token_hash, expires_at)
    VALUES (${user.id}, ${tokenHash}, ${expiresAt})
  `;

  const resetUrl = `${getPublicAppUrl(request)}/reset-password?token=${encodeURIComponent(token)}`;

  try {
    await sendAdminPasswordResetEmail({
      email: user.email,
      name: user.name,
      resetUrl,
      expiresMinutes: PASSWORD_RESET_EXPIRY_MINUTES,
    });
  } catch (error) {
    console.error('Failed to send admin-triggered password reset email:', error);
    return Response.json({ error: 'Could not send reset email' }, { status: 500 });
  }

  return Response.json({
    success: true,
    message: `Password reset email sent to ${user.email}`,
  });
}
