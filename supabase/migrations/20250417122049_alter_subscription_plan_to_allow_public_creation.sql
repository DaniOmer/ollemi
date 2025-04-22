-- Migration: Alter subscription_plans to allow public creation
-- Description: This migration adds a policy to allow public creation of subscription_plans

-- Up Migration

CREATE POLICY "Allow public write access to subscription_plans"
ON subscription_plans
FOR INSERT
TO public
WITH CHECK (true);

-- Add comment to explain the policy
COMMENT ON POLICY "Allow public write access to subscription_plans" ON subscription_plans IS 'This policy allows anyone to write to subscription_plans without authentication';