-- Privacy-minded site analytics for public pages.

CREATE TABLE IF NOT EXISTS site_pageviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL,
  referrer TEXT,
  locale TEXT CHECK (locale IN ('en', 'sv')),
  viewport_width INTEGER,
  visitor_hash TEXT NOT NULL,
  user_agent_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_pageviews_created_at ON site_pageviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_site_pageviews_path ON site_pageviews(path);
CREATE INDEX IF NOT EXISTS idx_site_pageviews_visitor_created ON site_pageviews(visitor_hash, created_at DESC);
