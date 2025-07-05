-- Description: Add discount_id to subscriptions table

-- Migration up
ALTER TABLE subscriptions ADD COLUMN discount_id UUID REFERENCES discounts(id);

-- Migration down
-- ALTER TABLE subscriptions DROP COLUMN discount_id;
