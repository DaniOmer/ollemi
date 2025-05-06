-- Description: Add rating field to companies table


-- Migration up
ALTER TABLE companies ADD COLUMN rating FLOAT;

-- Migration down
-- ALTER TABLE companies DROP COLUMN rating;