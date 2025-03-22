-- Migration: Add categories and company_categories tables
-- Description: Creates a categories table and a many-to-many relationship with companies

-- Up Migration

-- 1. Add team_size to companies table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'companies'
        AND column_name = 'team_size'
    ) THEN
        ALTER TABLE companies ADD COLUMN team_size TEXT;
        
        -- Add comment to explain the field
        COMMENT ON COLUMN companies.team_size IS 'The size of the company team (e.g., "1-5", "6-10", etc.)';
    END IF;
END
$$;

-- 2. Add industry to companies table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'companies'
        AND column_name = 'industry'
    ) THEN
        ALTER TABLE companies ADD COLUMN industry TEXT;
        
        -- Add comment to explain the field
        COMMENT ON COLUMN companies.industry IS 'The industry or sector that the company operates in';
    END IF;
END
$$;

-- 3. Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Add comment to explain the table
COMMENT ON TABLE categories IS 'Stores service categories that companies can offer';

-- 4. Create company_categories table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS company_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, category_id)
);

-- Add comment to explain the table
COMMENT ON TABLE company_categories IS 'Stores the relationship between companies and service categories';

-- Add RLS Policies for categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Anyone can view categories
CREATE POLICY "Anyone can view categories" ON categories
  FOR SELECT USING (true);

-- Add RLS Policies for company_categories
ALTER TABLE company_categories ENABLE ROW LEVEL SECURITY;

-- Companies can view their own categories
CREATE POLICY "Companies can view their own categories" ON company_categories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM companies c 
      WHERE c.id = company_categories.company_id AND c.user_id = auth.uid()
    )
  );

-- Companies can manage their own categories
CREATE POLICY "Companies can manage their own categories" ON company_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM companies c 
      WHERE c.id = company_categories.company_id AND c.user_id = auth.uid()
    )
  );

-- Anyone can view company categories
CREATE POLICY "Anyone can view company categories" ON company_categories
  FOR SELECT USING (true);

-- 5. Insert default categories
INSERT INTO categories (name, created_at)
VALUES 
  -- Services professionnels
  ('Haircut', NOW()),
  ('Massage', NOW()),
  ('Nails', NOW()),
  ('Makeup', NOW()),
  ('Skincare', NOW()),
  ('Tattoo', NOW())
ON CONFLICT (name) DO NOTHING;

-- Down Migration (uncomment to revert)
/*
DROP TABLE IF EXISTS company_categories;
DROP TABLE IF EXISTS categories;
ALTER TABLE companies DROP COLUMN IF EXISTS team_size;
ALTER TABLE companies DROP COLUMN IF EXISTS industry;
*/ 