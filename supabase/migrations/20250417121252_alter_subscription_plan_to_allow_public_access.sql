-- Migration: Alter subscription_plans to allow public access
-- Description: This migration adds a policy to allow public access to the subscription_plans table

-- Up Migration
-- Allow public access to read subscription_plans
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to subscription_plans"
ON subscription_plans
FOR SELECT
TO public
USING (true);

-- Add comment to explain the policy
COMMENT ON POLICY "Allow public read access to subscription_plans" ON subscription_plans IS 'This policy allows anyone to read subscription_plans without authentication';