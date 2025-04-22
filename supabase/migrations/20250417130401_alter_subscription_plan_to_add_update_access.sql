-- Migration: Alter subscription_plans to add update access
-- Description: This migration adds a policy to allow update access to the subscription_plans table

-- Up Migration
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow update access to subscription_plans"
ON subscription_plans
FOR UPDATE
TO authenticated
USING (true);

-- Add comment to explain the policy
COMMENT ON POLICY "Allow update access to subscription_plans" ON subscription_plans IS 'This policy allows authenticated users to update subscription_plans';
