export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { sendAdminPasswordResetEmail } from '@/lib/email';
import {
  PASSWORD_RESET_EXPIRY_MINUTES,
  createPasswordResetToken,
  ensurePasswordResetTable,
} from '@/lib/admin-password-reset';

function getBaseUrl(request: NextRequest) {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, '');
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');

  const host = request.headers.get('host');
  const proto = request.headers.get('x-forwarded-proto') || 'https';
  return host ? `${proto}://${host}` : '';
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

  if (!email) {
    return Response.json({ error: 'Email is required' }, { status: 400 });
  }

  await ensurePasswordResetTable();
  const sql = getDb();
  const [user] = await sql`
    SELECT id, email, name
    FROM users
    WHERE lower(email) = ${email}
      AND role = 'admin'
  `;

  if (user) {
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

    const baseUrl = getBaseUrl(request);
    const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;

    try {
      await sendAdminPasswordResetEmail({
        email: user.email,
        name: user.name,
        resetUrl,
        expiresMinutes: PASSWORD_RESET_EXPIRY_MINUTES,
      });
    } catch (error) {
      console.error('Failed to send admin password reset email:', error);
      return Response.json({ error: 'Could not send reset email' }, { status: 500 });
    }
  }

  return Response.json({
    success: true,
    message: 'If an admin account exists for that email, a reset link has been sent.',
  });
}
