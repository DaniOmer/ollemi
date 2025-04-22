-- Migration: Alter subscription_plans to add stripe_product_id
-- Description: This migration adds a stripe_product_id column to the subscription_plans table

-- Up Migration
ALTER TABLE subscription_plans ADD COLUMN stripe_product_id TEXT;

-- Down Migration
-- This would drop all data from stripe_product_id column in subscription_plans tables
-- It's recommended to backup data before running this migration
-- ALTER TABLE subscription_plans DROP COLUMN stripe_product_id;
