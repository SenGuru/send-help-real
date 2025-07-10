-- Create transactions table for SQLite
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transaction_id VARCHAR(50) NOT NULL UNIQUE,
  business_id INTEGER NOT NULL REFERENCES business(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
  subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
  tax DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (tax >= 0),
  discount DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
  points_earned INTEGER NOT NULL DEFAULT 0 CHECK (points_earned >= 0),
  payment_method VARCHAR(20) NOT NULL DEFAULT 'credit_card' 
    CHECK (payment_method IN ('cash', 'credit_card', 'debit_card', 'digital_wallet', 'gift_card', 'other')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')),
  transaction_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  store_name VARCHAR(255),
  store_location VARCHAR(500),
  cashier_id VARCHAR(100),
  receipt_number VARCHAR(100),
  items TEXT DEFAULT '[]',
  metadata TEXT DEFAULT '{}',
  refunded_at DATETIME,
  refund_reason TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS transactions_business_id_idx ON transactions(business_id);
CREATE INDEX IF NOT EXISTS transactions_user_id_idx ON transactions(user_id);
CREATE INDEX IF NOT EXISTS transactions_transaction_id_idx ON transactions(transaction_id);
CREATE INDEX IF NOT EXISTS transactions_status_idx ON transactions(status);
CREATE INDEX IF NOT EXISTS transactions_transaction_date_idx ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS transactions_business_user_idx ON transactions(business_id, user_id);