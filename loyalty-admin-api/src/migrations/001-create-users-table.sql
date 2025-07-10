-- Create users table for SQLite
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_id INTEGER NOT NULL REFERENCES business(id) ON DELETE CASCADE,
  member_id VARCHAR(20) NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20),
  date_of_birth DATE,
  total_points INTEGER NOT NULL DEFAULT 0 CHECK (total_points >= 0),
  available_points INTEGER NOT NULL DEFAULT 0 CHECK (available_points >= 0),
  lifetime_points INTEGER NOT NULL DEFAULT 0 CHECK (lifetime_points >= 0),
  current_ranking_id INTEGER REFERENCES rankings(id) ON DELETE SET NULL,
  join_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_activity DATETIME,
  is_active BOOLEAN NOT NULL DEFAULT 1,
  preferences TEXT DEFAULT '{"emailNotifications": true, "smsNotifications": true, "birthdayReminders": true, "promotionalOffers": true}',
  profile_image_url VARCHAR(500),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create unique constraint on business_id and email
CREATE UNIQUE INDEX IF NOT EXISTS users_business_email_unique ON users(business_id, email);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS users_business_id_idx ON users(business_id);
CREATE INDEX IF NOT EXISTS users_member_id_idx ON users(member_id);
CREATE INDEX IF NOT EXISTS users_total_points_idx ON users(total_points);
CREATE INDEX IF NOT EXISTS users_current_ranking_id_idx ON users(current_ranking_id);
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);