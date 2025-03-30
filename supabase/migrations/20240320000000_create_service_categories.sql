-- Create service_categories table
CREATE TABLE service_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(company_id, name)
);

-- Add RLS policies
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their company's service categories"
    ON service_categories FOR SELECT
    USING (auth.uid() IN (
        SELECT id FROM users WHERE company_id = service_categories.company_id
    ));

CREATE POLICY "Users can insert service categories for their company"
    ON service_categories FOR INSERT
    WITH CHECK (auth.uid() IN (
        SELECT id FROM users WHERE company_id = service_categories.company_id
    ));

CREATE POLICY "Users can update their company's service categories"
    ON service_categories FOR UPDATE
    USING (auth.uid() IN (
        SELECT id FROM users WHERE company_id = service_categories.company_id
    ));

CREATE POLICY "Users can delete their company's service categories"
    ON service_categories FOR DELETE
    USING (auth.uid() IN (
        SELECT id FROM users WHERE company_id = service_categories.company_id
    ));

-- Add foreign key to services table
ALTER TABLE services
ADD COLUMN category_id UUID REFERENCES service_categories(id) ON DELETE SET NULL; 