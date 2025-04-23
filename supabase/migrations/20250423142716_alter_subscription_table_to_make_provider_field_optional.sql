-- Description: This migration alters the subscription table to make the provider field optional

-- Up Migration
ALTER TABLE subscriptions ALTER COLUMN payment_method_id DROP NOT NULL;
ALTER TABLE subscriptions ALTER COLUMN provider_id DROP NOT NULL;
ALTER TABLE subscriptions ALTER COLUMN provider_subscription_id DROP NOT NULL;

-- Add comment to explain the migration
COMMENT ON COLUMN subscriptions.payment_method_id IS 'The payment method used to create the subscription';
COMMENT ON COLUMN subscriptions.provider_id IS 'The payment provider used to create the subscription';
COMMENT ON COLUMN subscriptions.provider_subscription_id IS 'The subscription ID from the payment provider';

-- Down Migration
-- ALTER TABLE subscriptions ALTER COLUMN payment_method_id SET NOT NULL;
-- ALTER TABLE subscriptions ALTER COLUMN provider_id SET NOT NULL;
-- ALTER TABLE subscriptions ALTER COLUMN provider_subscription_id SET NOT NULL;