-- Description: Add company_id to user_favorite table

ALTER TABLE user_favorites ADD COLUMN company_id UUID;
ALTER TABLE user_favorites DROP COLUMN professional_id;

-- Add foreign key constraint
ALTER TABLE user_favorites ADD CONSTRAINT fk_company_id FOREIGN KEY (company_id) REFERENCES companies(id);
