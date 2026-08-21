import { createHash, randomBytes } from 'crypto';
import { getDb } from './db';

export const PASSWORD_RESET_EXPIRY_MINUTES = 60;

export function createPasswordResetToken() {
  const token = randomBytes(32).toString('base64url');
  return {
    token,
    tokenHash: hashPasswordResetToken(token),
  };
}

export function hashPasswordResetToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export async function ensurePasswordResetTable() {
  const sql = getDb();
  await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`;
  await sql`
    CREATE TABLE IF NOT EXISTS admin_password_reset_tokens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT UNIQUE NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_admin_password_reset_tokens_user_id
    ON admin_password_reset_tokens(user_id)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_admin_password_reset_tokens_token_hash
    ON admin_password_reset_tokens(token_hash)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_admin_password_reset_tokens_expires_at
    ON admin_password_reset_tokens(expires_at)
  `;
}
