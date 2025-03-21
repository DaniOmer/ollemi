-- Migration: Fix missing tables and columns
-- Description: Creates missing tables and adds missing columns referenced in the application code

-- Up Migration

-- 1. Add avatar_url to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  language TEXT DEFAULT 'fr',
  theme TEXT DEFAULT 'light',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  UNIQUE(user_id)
);

-- Add RLS Policies for user_preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. Create user_points table
CREATE TABLE IF NOT EXISTS user_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  points INTEGER DEFAULT 0,
  last_earned TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  UNIQUE(user_id)
);

-- Add RLS Policies for user_points
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own points" ON user_points
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own points" ON user_points
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own points" ON user_points
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Create user_favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, professional_id)
);

-- Add RLS Policies for user_favorites
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own favorites" ON user_favorites
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own favorites" ON user_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own favorites" ON user_favorites
  FOR DELETE USING (auth.uid() = user_id);

-- 5. Add professional_id alias to appointments
-- Since we're already using pro_id but code is looking for professional_id
-- Let's create a view to handle this
CREATE OR REPLACE VIEW appointment_view AS
SELECT 
  id,
  pro_id,
  pro_id AS professional_id, -- Create the alias
  client_id,
  client_email,
  client_name,
  client_phone,
  start_time,
  end_time,
  service_id,
  status,
  notes,
  created_at,
  updated_at
FROM appointments;

-- Down Migration (uncomment to revert)
/*
DROP VIEW IF EXISTS appointment_view;
DROP TABLE IF EXISTS user_favorites;
DROP TABLE IF EXISTS user_points;
DROP TABLE IF EXISTS user_preferences;
ALTER TABLE users DROP COLUMN IF EXISTS avatar_url;
*/ 