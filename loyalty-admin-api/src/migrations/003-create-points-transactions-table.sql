-- Create points_transactions table for SQLite
CREATE TABLE IF NOT EXISTS points_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_id INTEGER NOT NULL REFERENCES business(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_id INTEGER REFERENCES transactions(id) ON DELETE SET NULL,
  type VARCHAR(30) NOT NULL CHECK (type IN (
    'earned_purchase', 'earned_bonus', 'earned_manual',
    'redeemed_coupon', 'redeemed_reward', 'redeemed_manual',
    'expired', 'refunded', 'transferred_in', 'transferred_out'
  )),
  points INTEGER NOT NULL CHECK (points != 0),
  description VARCHAR(500) NOT NULL,
  reference_id VARCHAR(100),
  reference_type VARCHAR(20) CHECK (reference_type IN (
    'transaction', 'coupon', 'reward', 'promotion', 'manual', 'referral', 'birthday', 'other'
  )),
  balance_before INTEGER NOT NULL CHECK (balance_before >= 0),
  balance_after INTEGER NOT NULL CHECK (balance_after >= 0),
  multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.0 CHECK (multiplier >= 0),
  expires_at DATETIME,
  processed_by VARCHAR(100),
  metadata TEXT DEFAULT '{}',
  is_reversed BOOLEAN NOT NULL DEFAULT 0,
  reversed_at DATETIME,
  reversal_reason TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS points_transactions_business_id_idx ON points_transactions(business_id);
CREATE INDEX IF NOT EXISTS points_transactions_user_id_idx ON points_transactions(user_id);
CREATE INDEX IF NOT EXISTS points_transactions_transaction_id_idx ON points_transactions(transaction_id);
CREATE INDEX IF NOT EXISTS points_transactions_type_idx ON points_transactions(type);
CREATE INDEX IF NOT EXISTS points_transactions_reference_idx ON points_transactions(reference_id, reference_type);
CREATE INDEX IF NOT EXISTS points_transactions_created_at_idx ON points_transactions(created_at);
CREATE INDEX IF NOT EXISTS points_transactions_expires_at_idx ON points_transactions(expires_at);
CREATE INDEX IF NOT EXISTS points_transactions_business_user_created_idx ON points_transactions(business_id, user_id, created_at);