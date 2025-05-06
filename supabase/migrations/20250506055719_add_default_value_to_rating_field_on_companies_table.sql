-- Description: Add default value to rating field on companies table

-- Migration up
ALTER TABLE companies ALTER COLUMN rating SET DEFAULT 0;

-- Migration down
-- ALTER TABLE companies ALTER COLUMN rating DROP DEFAULT;