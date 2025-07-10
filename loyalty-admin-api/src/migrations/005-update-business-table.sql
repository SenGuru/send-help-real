-- Add new fields to business table for comprehensive business information
-- Migration: 005-update-business-table.sql

-- Add category field
ALTER TABLE business 
ADD COLUMN IF NOT EXISTS category VARCHAR(100);

-- Add website field  
ALTER TABLE business 
ADD COLUMN IF NOT EXISTS website VARCHAR(255);

-- Add established year field
ALTER TABLE business 
ADD COLUMN IF NOT EXISTS established VARCHAR(4);

-- Add member since field
ALTER TABLE business 
ADD COLUMN IF NOT EXISTS member_since VARCHAR(4);

-- Add total members field
ALTER TABLE business 
ADD COLUMN IF NOT EXISTS total_members INTEGER DEFAULT 0;

-- Add features field (JSON array)
ALTER TABLE business 
ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]';

-- Add social media field (JSON object)
ALTER TABLE business 
ADD COLUMN IF NOT EXISTS social_media JSONB DEFAULT '{"instagram": "", "facebook": "", "twitter": ""}';

-- Add loyalty benefits field (JSON array)
ALTER TABLE business 
ADD COLUMN IF NOT EXISTS loyalty_benefits JSONB DEFAULT '[]';

-- Update existing demo business with sample data
UPDATE business 
SET 
  category = 'Demo Business',
  website = 'https://demo.loyaltyapp.com',
  established = '2020',
  member_since = '2023',
  total_members = 500,
  features = '["Free WiFi", "Loyalty Program", "Online Ordering", "Mobile App"]',
  social_media = '{"instagram": "@demo_business", "facebook": "Demo Business Official", "twitter": "@demo_business"}',
  loyalty_benefits = '["Earn 1 point per $1 spent", "Free item after 10 purchases", "Birthday month 20% discount", "Exclusive member offers"]'
WHERE business_code = 'DEMO1';