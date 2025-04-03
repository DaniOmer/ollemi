-- Migration: Make ollemi bucket public
-- Description: Updates the ollemi bucket to be publicly accessible

-- Update the bucket to be public
UPDATE storage.buckets
SET public = true
WHERE id = 'ollemi';

-- Add a policy to allow public access to objects
CREATE POLICY "Allow public access to objects"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'ollemi');
