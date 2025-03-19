-- Migration: Add accept_terms field to users table
-- Description: Adds a boolean field to track user acceptance of terms and conditions

-- Up Migration
-- Add a new column to the users table with NOT NULL constraint
ALTER TABLE users ADD COLUMN accept_terms BOOLEAN DEFAULT FALSE NOT NULL;

-- Set a value for any existing rows (in case there's existing data)
UPDATE users SET accept_terms = FALSE WHERE accept_terms IS NULL;

-- Down Migration (commented out, uncomment to revert)
-- ALTER TABLE users DROP COLUMN accept_terms;
