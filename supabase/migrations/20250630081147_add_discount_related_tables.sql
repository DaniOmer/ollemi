-- Description: Add tables for discount related data

-- Discounts
CREATE TABLE discounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
    discount_value NUMERIC NOT NULL,
    discount_expiration_date TIMESTAMP NOT NULL,
    max_uses INTEGER NOT NULL DEFAULT 1,
    usage_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Discounts Row Level Security
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to all users" ON discounts FOR SELECT USING (true);
CREATE POLICY "Allow insert access to admin users" ON discounts FOR INSERT WITH CHECK (auth.role() = 'admin');
CREATE POLICY "Allow update access to admin users" ON discounts FOR UPDATE USING (auth.role() = 'admin');
CREATE POLICY "Allow delete access to admin users" ON discounts FOR DELETE USING (auth.role() = 'admin');

-- Create first discount
INSERT INTO discounts (code, description, discount_type, discount_value, discount_expiration_date, max_uses) 
    VALUES ('WELCOME', 'Three months free', 'percentage', 100, now() + interval '6 months', 1);

-- Discounts Usage
CREATE TABLE discounts_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discount_id UUID NOT NULL REFERENCES discounts(id),
    user_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT now()
);