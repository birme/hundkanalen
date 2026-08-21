-- Admin password reset tokens

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS admin_password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_password_reset_tokens_user_id
  ON admin_password_reset_tokens(user_id);

CREATE INDEX IF NOT EXISTS idx_admin_password_reset_tokens_token_hash
  ON admin_password_reset_tokens(token_hash);

CREATE INDEX IF NOT EXISTS idx_admin_password_reset_tokens_expires_at
  ON admin_password_reset_tokens(expires_at);
