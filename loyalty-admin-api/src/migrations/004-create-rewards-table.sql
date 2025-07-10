-- Create rewards table for SQLite
CREATE TABLE IF NOT EXISTS rewards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_id INTEGER NOT NULL REFERENCES business(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  points_cost INTEGER NOT NULL CHECK (points_cost >= 1),
  type VARCHAR(30) NOT NULL DEFAULT 'free_item' CHECK (type IN (
    'free_item', 'discount_percentage', 'discount_amount', 
    'free_shipping', 'upgrade', 'experience', 'other'
  )),
  value DECIMAL(10,2),
  image_url VARCHAR(500),
  terms_and_conditions TEXT,
  valid_from DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  valid_until DATETIME,
  max_redemptions INTEGER CHECK (max_redemptions >= 1),
  current_redemptions INTEGER NOT NULL DEFAULT 0 CHECK (current_redemptions >= 0),
  max_redemptions_per_user INTEGER DEFAULT 1 CHECK (max_redemptions_per_user >= 1),
  minimum_ranking_level INTEGER CHECK (minimum_ranking_level >= 1),
  is_active BOOLEAN NOT NULL DEFAULT 1,
  is_featured BOOLEAN NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  metadata TEXT DEFAULT '{}',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS rewards_business_id_idx ON rewards(business_id);
CREATE INDEX IF NOT EXISTS rewards_points_cost_idx ON rewards(points_cost);
CREATE INDEX IF NOT EXISTS rewards_type_idx ON rewards(type);
CREATE INDEX IF NOT EXISTS rewards_is_active_idx ON rewards(is_active);
CREATE INDEX IF NOT EXISTS rewards_is_featured_idx ON rewards(is_featured);
CREATE INDEX IF NOT EXISTS rewards_valid_dates_idx ON rewards(valid_from, valid_until);
CREATE INDEX IF NOT EXISTS rewards_business_active_sort_idx ON rewards(business_id, is_active, sort_order);