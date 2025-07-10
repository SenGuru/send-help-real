-- Create Point Tier System Tables
-- Migration: 006-create-point-tier-system.sql

-- Create point_tiers table
CREATE TABLE IF NOT EXISTS point_tiers (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL REFERENCES business(id) ON DELETE CASCADE,
  tier_level INTEGER NOT NULL CHECK (tier_level >= 1 AND tier_level <= 4),
  name VARCHAR(100) NOT NULL,
  points_required INTEGER NOT NULL CHECK (points_required >= 0),
  description TEXT,
  rewards JSONB DEFAULT '[]',
  color VARCHAR(7) DEFAULT '#9CAF88',
  icon_url VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(business_id, tier_level)
);

-- Create indexes for point_tiers
CREATE INDEX IF NOT EXISTS idx_point_tiers_business_id ON point_tiers(business_id);
CREATE INDEX IF NOT EXISTS idx_point_tiers_points_required ON point_tiers(points_required);
CREATE INDEX IF NOT EXISTS idx_point_tiers_sort_order ON point_tiers(sort_order);

-- Create user_point_tiers table
CREATE TABLE IF NOT EXISTS user_point_tiers (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL REFERENCES business(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  current_tier_id INTEGER REFERENCES point_tiers(id) ON DELETE SET NULL,
  tier_points INTEGER DEFAULT 0 NOT NULL CHECK (tier_points >= 0),
  lifetime_tier_points INTEGER DEFAULT 0 NOT NULL CHECK (lifetime_tier_points >= 0),
  last_tier_update TIMESTAMP WITH TIME ZONE,
  tier_history JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(business_id, user_id)
);

-- Create indexes for user_point_tiers
CREATE INDEX IF NOT EXISTS idx_user_point_tiers_business_id ON user_point_tiers(business_id);
CREATE INDEX IF NOT EXISTS idx_user_point_tiers_user_id ON user_point_tiers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_point_tiers_current_tier_id ON user_point_tiers(current_tier_id);
CREATE INDEX IF NOT EXISTS idx_user_point_tiers_tier_points ON user_point_tiers(tier_points);

-- Insert default point tiers for existing demo business
INSERT INTO point_tiers (business_id, tier_level, name, points_required, description, rewards, color) 
SELECT 
  id as business_id,
  1 as tier_level,
  'Bronze Member' as name,
  0 as points_required,
  'Welcome tier for new members' as description,
  '[
    {"type": "discount", "value": "5", "description": "5% discount on all purchases"},
    {"type": "birthday", "value": "10% birthday discount", "description": "Special birthday offer"}
  ]'::jsonb as rewards,
  '#CD7F32' as color
FROM business 
WHERE business_code = 'DEMO1'
AND NOT EXISTS (SELECT 1 FROM point_tiers WHERE business_id = business.id AND tier_level = 1);

INSERT INTO point_tiers (business_id, tier_level, name, points_required, description, rewards, color) 
SELECT 
  id as business_id,
  2 as tier_level,
  'Silver Member' as name,
  500 as points_required,
  'Unlock exclusive silver benefits' as description,
  '[
    {"type": "discount", "value": "10", "description": "10% discount on all purchases"},
    {"type": "pointMultiplier", "value": "1.2", "description": "20% bonus points on purchases"},
    {"type": "freeShipping", "value": "Free shipping on orders over $50", "description": "Complimentary shipping"}
  ]'::jsonb as rewards,
  '#C0C0C0' as color
FROM business 
WHERE business_code = 'DEMO1'
AND NOT EXISTS (SELECT 1 FROM point_tiers WHERE business_id = business.id AND tier_level = 2);

INSERT INTO point_tiers (business_id, tier_level, name, points_required, description, rewards, color) 
SELECT 
  id as business_id,
  3 as tier_level,
  'Gold Member' as name,
  1500 as points_required,
  'Premium tier with enhanced rewards' as description,
  '[
    {"type": "discount", "value": "15", "description": "15% discount on all purchases"},
    {"type": "pointMultiplier", "value": "1.5", "description": "50% bonus points on purchases"},
    {"type": "freeShipping", "value": "Free shipping on all orders", "description": "Always free shipping"},
    {"type": "earlyAccess", "value": "Early access to sales and new products", "description": "VIP early access"}
  ]'::jsonb as rewards,
  '#FFD700' as color
FROM business 
WHERE business_code = 'DEMO1'
AND NOT EXISTS (SELECT 1 FROM point_tiers WHERE business_id = business.id AND tier_level = 3);

INSERT INTO point_tiers (business_id, tier_level, name, points_required, description, rewards, color) 
SELECT 
  id as business_id,
  4 as tier_level,
  'Platinum Member' as name,
  3000 as points_required,
  'Elite tier with maximum benefits' as description,
  '[
    {"type": "discount", "value": "20", "description": "20% discount on all purchases"},
    {"type": "pointMultiplier", "value": "2", "description": "Double points on all purchases"},
    {"type": "freeShipping", "value": "Free express shipping", "description": "Priority shipping"},
    {"type": "earlyAccess", "value": "Exclusive early access", "description": "First access to everything"},
    {"type": "custom", "value": "Personal shopping assistant", "description": "Dedicated support"}
  ]'::jsonb as rewards,
  '#E5E4E2' as color
FROM business 
WHERE business_code = 'DEMO1'
AND NOT EXISTS (SELECT 1 FROM point_tiers WHERE business_id = business.id AND tier_level = 4);

-- Create user point tier records for existing users (if any)
INSERT INTO user_point_tiers (business_id, user_id, tier_points, lifetime_tier_points)
SELECT 
  u.business_id,
  u.id as user_id,
  0 as tier_points,  -- Start everyone at 0 tier points
  0 as lifetime_tier_points
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM user_point_tiers upt 
  WHERE upt.business_id = u.business_id AND upt.user_id = u.id
);

-- Update current_tier_id to Bronze tier for all users
UPDATE user_point_tiers 
SET current_tier_id = (
  SELECT pt.id 
  FROM point_tiers pt 
  WHERE pt.business_id = user_point_tiers.business_id 
  AND pt.tier_level = 1 
  AND pt.is_active = true
  LIMIT 1
)
WHERE current_tier_id IS NULL;