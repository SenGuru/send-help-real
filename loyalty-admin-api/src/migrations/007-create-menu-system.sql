-- Create Menu Point Collection System
-- Migration: 007-create-menu-system.sql

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_id INTEGER NOT NULL REFERENCES business(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  points_earned INTEGER NOT NULL CHECK (points_earned >= 0),
  image_url VARCHAR(500),
  is_available BOOLEAN DEFAULT 1 NOT NULL,
  is_active BOOLEAN DEFAULT 1 NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  metadata TEXT DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for menu_items
CREATE INDEX IF NOT EXISTS idx_menu_items_business_id ON menu_items(business_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(is_available);
CREATE INDEX IF NOT EXISTS idx_menu_items_active ON menu_items(is_active);
CREATE INDEX IF NOT EXISTS idx_menu_items_sort_order ON menu_items(sort_order);
CREATE INDEX IF NOT EXISTS idx_menu_items_business_category ON menu_items(business_id, category);

-- Create menu_item_purchases table
CREATE TABLE IF NOT EXISTS menu_item_purchases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_id INTEGER NOT NULL REFERENCES business(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  menu_item_id INTEGER NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1 NOT NULL CHECK (quantity >= 1),
  price_at_purchase DECIMAL(10,2) NOT NULL CHECK (price_at_purchase >= 0),
  points_earned_at_purchase INTEGER NOT NULL CHECK (points_earned_at_purchase >= 0),
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
  total_points_earned INTEGER NOT NULL CHECK (total_points_earned >= 0),
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled', 'refunded')),
  payment_method VARCHAR(50),
  notes TEXT,
  purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for menu_item_purchases
CREATE INDEX IF NOT EXISTS idx_menu_purchases_business_id ON menu_item_purchases(business_id);
CREATE INDEX IF NOT EXISTS idx_menu_purchases_user_id ON menu_item_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_menu_purchases_menu_item_id ON menu_item_purchases(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_menu_purchases_status ON menu_item_purchases(status);
CREATE INDEX IF NOT EXISTS idx_menu_purchases_date ON menu_item_purchases(purchase_date);
CREATE INDEX IF NOT EXISTS idx_menu_purchases_business_user ON menu_item_purchases(business_id, user_id);
CREATE INDEX IF NOT EXISTS idx_menu_purchases_business_date ON menu_item_purchases(business_id, purchase_date);

-- Insert sample menu items for demo business
INSERT INTO menu_items (business_id, name, description, category, price, points_earned, sort_order)
SELECT 
  id as business_id,
  'Regular Coffee' as name,
  'Fresh brewed coffee, your choice of roast' as description,
  'Beverages' as category,
  3.50 as price,
  10 as points_earned,
  1 as sort_order
FROM business 
WHERE business_code = 'DEMO1'
AND NOT EXISTS (SELECT 1 FROM menu_items WHERE business_id = business.id AND name = 'Regular Coffee');

INSERT INTO menu_items (business_id, name, description, category, price, points_earned, sort_order)
SELECT 
  id as business_id,
  'Latte' as name,
  'Espresso with steamed milk and foam' as description,
  'Beverages' as category,
  4.25 as price,
  15 as points_earned,
  2 as sort_order
FROM business 
WHERE business_code = 'DEMO1'
AND NOT EXISTS (SELECT 1 FROM menu_items WHERE business_id = business.id AND name = 'Latte');

INSERT INTO menu_items (business_id, name, description, category, price, points_earned, sort_order)
SELECT 
  id as business_id,
  'Cappuccino' as name,
  'Espresso with steamed milk and thick foam' as description,
  'Beverages' as category,
  4.50 as price,
  15 as points_earned,
  3 as sort_order
FROM business 
WHERE business_code = 'DEMO1'
AND NOT EXISTS (SELECT 1 FROM menu_items WHERE business_id = business.id AND name = 'Cappuccino');

INSERT INTO menu_items (business_id, name, description, category, price, points_earned, sort_order)
SELECT 
  id as business_id,
  'Croissant' as name,
  'Buttery, flaky pastry' as description,
  'Pastries' as category,
  2.75 as price,
  8 as points_earned,
  1 as sort_order
FROM business 
WHERE business_code = 'DEMO1'
AND NOT EXISTS (SELECT 1 FROM menu_items WHERE business_id = business.id AND name = 'Croissant');

INSERT INTO menu_items (business_id, name, description, category, price, points_earned, sort_order)
SELECT 
  id as business_id,
  'Blueberry Muffin' as name,
  'Fresh baked muffin with real blueberries' as description,
  'Pastries' as category,
  3.25 as price,
  10 as points_earned,
  2 as sort_order
FROM business 
WHERE business_code = 'DEMO1'
AND NOT EXISTS (SELECT 1 FROM menu_items WHERE business_id = business.id AND name = 'Blueberry Muffin');

INSERT INTO menu_items (business_id, name, description, category, price, points_earned, sort_order)
SELECT 
  id as business_id,
  'Breakfast Sandwich' as name,
  'Egg, cheese, and bacon on an English muffin' as description,
  'Food' as category,
  6.50 as price,
  20 as points_earned,
  1 as sort_order
FROM business 
WHERE business_code = 'DEMO1'
AND NOT EXISTS (SELECT 1 FROM menu_items WHERE business_id = business.id AND name = 'Breakfast Sandwich');

INSERT INTO menu_items (business_id, name, description, category, price, points_earned, sort_order)
SELECT 
  id as business_id,
  'Turkey Club Sandwich' as name,
  'Sliced turkey, bacon, lettuce, tomato, and mayo' as description,
  'Food' as category,
  8.75 as price,
  25 as points_earned,
  2 as sort_order
FROM business 
WHERE business_code = 'DEMO1'
AND NOT EXISTS (SELECT 1 FROM menu_items WHERE business_id = business.id AND name = 'Turkey Club Sandwich');

INSERT INTO menu_items (business_id, name, description, category, price, points_earned, sort_order)
SELECT 
  id as business_id,
  'Caesar Salad' as name,
  'Crisp romaine lettuce with Caesar dressing and croutons' as description,
  'Food' as category,
  7.25 as price,
  22 as points_earned,
  3 as sort_order
FROM business 
WHERE business_code = 'DEMO1'
AND NOT EXISTS (SELECT 1 FROM menu_items WHERE business_id = business.id AND name = 'Caesar Salad');