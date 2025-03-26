-- Allow public access to read services
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to services"
ON services
FOR SELECT
TO public
USING (true);

-- Add comment to explain the policy
COMMENT ON POLICY "Allow public read access to services" ON services IS 'This policy allows anyone to read services without authentication';