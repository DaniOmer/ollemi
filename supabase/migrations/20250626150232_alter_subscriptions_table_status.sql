-- Description: This migration alters the subscriptions table to update the status field

-- Up Migration
ALTER TABLE subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_status_check;

ALTER TABLE subscriptions
  ADD CONSTRAINT subscriptions_status_check
  CHECK (status IN (
    'incomplete',
    'incomplete_expired',
    'trialing',
    'active',
    'past_due',
    'canceled',
    'unpaid',
    'expiring_soon',
    'expired'
  ));

-- Down Migration
-- ALTER TABLE subscriptions
--   DROP CONSTRAINT IF EXISTS subscriptions_status_check;

-- ALTER TABLE subscriptions
--   ADD CONSTRAINT subscriptions_status_check
--   CHECK (status IN ('incomplete', 'incomplete_expired', 'trialing', 'active', 'past_due', 'canceled', 'unpaid'));