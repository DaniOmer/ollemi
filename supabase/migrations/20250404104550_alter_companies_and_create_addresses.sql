-- Migration: Alter companies and create addresses table
-- Description: Removes address fields from companies and creates a new addresses table with Google Places API fields

-- Up Migration

-- 1. Create addresses table
CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  formatted_address TEXT NOT NULL,
  street_number TEXT,
  street_name TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT,
  place_id TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  UNIQUE(company_id)
);

-- Add comment to explain the table
COMMENT ON TABLE addresses IS 'Stores address information for companies, using data from Google Places API';

-- 2. Migrate existing address data from companies to addresses table
INSERT INTO addresses (
  company_id,
  formatted_address,
  city,
  postal_code,
  created_at
)
SELECT
  id AS company_id,
  address AS formatted_address,
  city,
  zipcode AS postal_code,
  NOW() AS created_at
FROM companies
WHERE address IS NOT NULL OR city IS NOT NULL OR zipcode IS NOT NULL;

-- 3. Remove address fields from companies table
ALTER TABLE companies 
  DROP COLUMN IF EXISTS address,
  DROP COLUMN IF EXISTS city, 
  DROP COLUMN IF EXISTS zipcode;

-- 4. Add RLS Policies for addresses
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- Companies can view and manage their own addresses
CREATE POLICY "Companies can view their own addresses" ON addresses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM companies c 
      WHERE c.id = addresses.company_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Companies can manage their own addresses" ON addresses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM companies c 
      WHERE c.id = addresses.company_id AND c.user_id = auth.uid()
    )
  );

-- Anyone can view company addresses
CREATE POLICY "Anyone can view company addresses" ON addresses
  FOR SELECT USING (true);

-- 5. Create a trigger function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_addresses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to update the updated_at timestamp when an address is updated
CREATE TRIGGER update_addresses_updated_at_trigger
BEFORE UPDATE ON addresses
FOR EACH ROW
EXECUTE FUNCTION public.update_addresses_updated_at();

-- Down Migration (if needed)
/*
-- 1. Add address fields back to companies table
ALTER TABLE companies 
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS zipcode TEXT;

-- 2. Migrate data back from addresses to companies
UPDATE companies c
SET 
  address = a.formatted_address,
  city = a.city,
  zipcode = a.postal_code
FROM addresses a
WHERE c.id = a.company_id;

-- 3. Drop addresses table and related objects
DROP TRIGGER IF EXISTS update_addresses_updated_at_trigger ON addresses;
DROP FUNCTION IF EXISTS public.update_addresses_updated_at();
DROP TABLE IF EXISTS addresses;
*/
