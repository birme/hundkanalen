-- Migration 003: Privacy controls, global access code, favorite places
-- Run via POST /api/seed

-- 1. Add is_public flag to photos (admin selects which photos are public)
ALTER TABLE photos ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT false;

-- 2. SITE_SETTINGS table (stores global access code and other settings)
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. FAVORITE_PLACES table (admin-curated recommendations)
CREATE TABLE IF NOT EXISTS favorite_places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'activity',
  icon TEXT DEFAULT '',
  url TEXT,
  distance TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_favorite_places_category ON favorite_places(category);
