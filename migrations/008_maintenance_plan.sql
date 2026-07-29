CREATE TABLE IF NOT EXISTS maintenance_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  area TEXT NOT NULL DEFAULT 'general',
  description TEXT,
  source TEXT,
  priority TEXT NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'planned'
    CHECK (status IN ('planned', 'in_progress', 'done', 'deferred')),
  target_year INTEGER,
  estimated_cost INTEGER,
  actual_cost INTEGER,
  completed_at DATE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_maintenance_items_status ON maintenance_items(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_items_target_year ON maintenance_items(target_year);
CREATE INDEX IF NOT EXISTS idx_maintenance_items_priority ON maintenance_items(priority);
