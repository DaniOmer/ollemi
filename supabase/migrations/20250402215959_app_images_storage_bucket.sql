-- Migration: Add ollemi storage bucket
-- Description: Adds a storage bucket for ollemi images

-- Up Migration
-- Create the bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('ollemi', 'ollemi', false);

-- Create access policy for the bucket
CREATE POLICY "Allow authenticated uploads"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'ollemi' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Create policy to allow authenticated users to select their own objects
CREATE POLICY "Allow users to select their own objects"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'ollemi' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Create policy to allow authenticated users to update their own objects
CREATE POLICY "Allow users to update their own objects"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'ollemi' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Create policy to allow authenticated users to delete their own objects
CREATE POLICY "Allow users to delete their own objects"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'ollemi' AND (storage.foldername(name))[1] = auth.uid()::text);
