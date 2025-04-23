-- Enable insert for unauthenticated user
-- Description: This migration enables insert for unauthenticated user

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create a policy for unauthenticated user to insert
CREATE POLICY "Enable insert for unauthenticated user" 
ON subscriptions
FOR INSERT 
TO public 
WITH CHECK (true);

-- Create a policy for unauthenticated user to select
CREATE POLICY "Enable select for unauthenticated user" 
ON subscriptions
FOR SELECT 
TO public 
USING (true);

-- Add comment to explain the policy
COMMENT ON POLICY "Enable insert for unauthenticated user" ON subscriptions IS 'This policy allows unauthenticated users to insert into the subscriptions table';

-- Down Migration
-- ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;
-- DELETE POLICY "Enable insert for unauthenticated user" ON subscriptions;

