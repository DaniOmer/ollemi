-- Migration: Alter subscription_plans to add update access to unauthenticated user
-- Description: This migration adds a policy to allow update access to the subscription_plans table to unauthenticated users

-- Up Migration
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow update access to subscription_plans to unauthenticated users"
ON subscription_plans
FOR UPDATE
TO public
USING (true);

-- Add comment to explain the policy
COMMENT ON POLICY "Allow update access to subscription_plans to unauthenticated users" ON subscription_plans IS 'This policy allows unauthenticated users to update subscription_plans';

-- Down Migration
-- ALTER TABLE subscription_plans DISABLE ROW LEVEL SECURITY;
-- DELETE POLICY "Allow update access to subscription_plans to unauthenticated users" ON subscription_plans;


