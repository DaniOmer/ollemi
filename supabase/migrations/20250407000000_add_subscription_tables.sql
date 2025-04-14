-- Migration: Add subscription tables
-- Description: Creates tables for subscription management with support for multiple payment providers

-- Up Migration

-- 1. Create payment_providers table
CREATE TABLE IF NOT EXISTS payment_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  config JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Insert default payment provider (Stripe)
INSERT INTO payment_providers (name, description, is_active, config)
VALUES ('stripe', 'Stripe payment provider', true, '{"display_name": "Carte bancaire"}');

-- 2. Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'eur',
  interval TEXT NOT NULL CHECK (interval IN ('day', 'week', 'month', 'year')),
  interval_count INTEGER NOT NULL DEFAULT 1,
  trial_period_days INTEGER,
  features JSONB,
  is_active BOOLEAN DEFAULT true,
  stripe_price_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Insert some default subscription plans
INSERT INTO subscription_plans (name, description, price, currency, interval, features, stripe_price_id)
VALUES 
  ('Basic', 'Basic subscription plan for professionals', 19.99, 'eur', 'month', '{"appointments": 100, "services": 5, "featured": false}', NULL),
  ('Pro', 'Professional subscription with more features', 39.99, 'eur', 'month', '{"appointments": 500, "services": 20, "featured": true}', NULL),
  ('Premium', 'Premium subscription with unlimited features', 79.99, 'eur', 'month', '{"appointments": -1, "services": -1, "featured": true}', NULL);

-- 3. Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES payment_providers(id) ON DELETE CASCADE NOT NULL,
  provider_payment_method_id TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  type TEXT NOT NULL,
  last_four TEXT,
  expiry_month INTEGER,
  expiry_year INTEGER,
  billing_details JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  UNIQUE(user_id, provider_id, provider_payment_method_id)
);

-- 4. Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id) ON DELETE RESTRICT NOT NULL,
  payment_method_id UUID REFERENCES payment_methods(id) ON DELETE RESTRICT,
  provider_id UUID REFERENCES payment_providers(id) ON DELETE RESTRICT NOT NULL,
  provider_subscription_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('incomplete', 'incomplete_expired', 'trialing', 'active', 'past_due', 'canceled', 'unpaid')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMPTZ,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- 5. Create subscription_invoices table
CREATE TABLE IF NOT EXISTS subscription_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE NOT NULL,
  provider_invoice_id TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'eur',
  status TEXT NOT NULL CHECK (status IN ('draft', 'open', 'paid', 'uncollectible', 'void')),
  invoice_url TEXT,
  invoice_pdf TEXT,
  billing_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- 6. Add subscription_id to companies table
ALTER TABLE companies
ADD COLUMN subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL;

-- 7. RLS Policies for payment_providers
ALTER TABLE payment_providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active payment providers" ON payment_providers
  FOR SELECT USING (is_active = true);

-- 8. RLS Policies for subscription_plans
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active subscription plans" ON subscription_plans
  FOR SELECT USING (is_active = true);

-- 9. RLS Policies for payment_methods
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own payment methods" ON payment_methods
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own payment methods" ON payment_methods
  FOR ALL USING (auth.uid() = user_id);

-- 10. RLS Policies for subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own subscriptions" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- 11. RLS Policies for subscription_invoices
ALTER TABLE subscription_invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own subscription invoices" ON subscription_invoices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM subscriptions s
      WHERE s.id = subscription_invoices.subscription_id
      AND s.user_id = auth.uid()
    )
  );

-- Down Migration
-- This would drop all the subscription-related tables
-- Note: This is a destructive operation and would lose all subscription data
-- It's recommended to backup data before running this migration

-- ALTER TABLE companies DROP COLUMN IF EXISTS subscription_id;
-- DROP TABLE IF EXISTS subscription_invoices;
-- DROP TABLE IF EXISTS subscriptions;
-- DROP TABLE IF EXISTS payment_methods;
-- DROP TABLE IF EXISTS subscription_plans;
-- DROP TABLE IF EXISTS payment_providers;
