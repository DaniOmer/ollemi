-- Description: Alter reviews table to add review column

ALTER TABLE reviews DROP COLUMN review;
ALTER TABLE reviews ADD COLUMN comment TEXT;