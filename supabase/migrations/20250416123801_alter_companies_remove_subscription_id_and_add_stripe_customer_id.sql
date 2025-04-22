-- Migration: Alter companies to remove subscription_id and add stripe_customer_id
-- Description: This migration removes the subscription_id column from companies table and adds stripe_customer_id column

-- Up Migration
ALTER TABLE companies DROP COLUMN IF EXISTS subscription_id;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS active_stripe_subscription_id TEXT;

-- Down Migration
-- This would drop all data from stripe_customer_id column in companies tables
-- It's recommended to backup data before running this migration
-- ALTER TABLE companies DROP COLUMN IF EXISTS stripe_customer_id;
-- ALTER TABLE companies ADD COLUMN subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL;
