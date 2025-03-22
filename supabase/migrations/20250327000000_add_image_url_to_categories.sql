-- Migration: Add image_url to categories
-- Description: Adds an image_url column to the categories table

-- Up Migration

-- Add image_url to categories table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'categories'
        AND column_name = 'image_url'
    ) THEN
        ALTER TABLE categories ADD COLUMN image_url TEXT;
        
        -- Add comment to explain the field
        COMMENT ON COLUMN categories.image_url IS 'URL of the category image';
    END IF;
END
$$;

-- Update existing categories with default image URLs
UPDATE categories 
SET image_url = CASE 
    WHEN name = 'Haircut' THEN '/images/categories/haircut.jpg'
    WHEN name = 'Nails' THEN '/images/categories/nails.jpg'
    WHEN name = 'Makeup' THEN '/images/categories/makeup.jpg'
    WHEN name = 'Skincare' THEN '/images/categories/skincare.jpg'
    WHEN name = 'Massage' THEN '/images/categories/massage.jpg'
    WHEN name = 'Tattoo' THEN '/images/categories/tattoo.jpg'
    ELSE '/images/categories/default.jpg'
END
WHERE image_url IS NULL;

-- Down Migration (uncomment to revert)
/*
ALTER TABLE categories DROP COLUMN IF EXISTS image_url;
*/ 