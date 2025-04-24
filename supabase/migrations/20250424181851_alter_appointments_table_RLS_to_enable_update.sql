-- Description: This migration adds RLS policies to the appointments table to enable updates.

-- Add RLS policies to the appointments table
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Create UPDATE policies
-- For company owner
CREATE POLICY "Enable update for owner of company" ON appointments
FOR UPDATE TO authenticated
USING (company_id IN (SELECT company_id FROM companies WHERE user_id = auth.uid()));

-- For client of the booking
CREATE POLICY "Enable update for client of booking" ON appointments
FOR UPDATE TO authenticated
USING (client_id = auth.uid());

-- Down migration
-- ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
-- DROP POLICY "Enable select for owner of company" ON appointments;
-- DROP POLICY "Enable select for client of booking" ON appointments;
-- DROP POLICY "Enable update for owner of company" ON appointments;
-- DROP POLICY "Enable update for client of booking" ON appointments;
