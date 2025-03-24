-- Migration: Add insert policy for companies
-- Description: Allows authenticated users to create their own companies

-- Up Migration

-- Check if the policy already exists to avoid errors
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'companies' 
        AND policyname = 'Users can create their own companies'
    ) THEN
        -- Drop any conflicting policies if they exist
        DROP POLICY IF EXISTS "Companies can insert their own data" ON companies;
        
        -- Create the new insertion policy
        CREATE POLICY "Users can create their own companies" ON companies
            FOR INSERT 
            WITH CHECK (auth.uid() = user_id);
    END IF;
END
$$;

-- Also add a constraint to ensure a user can only create one company
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'companies_user_id_key' 
        AND table_name = 'companies'
    ) THEN
        ALTER TABLE companies ADD CONSTRAINT companies_user_id_key UNIQUE (user_id);
    END IF;
END
$$;

-- Down Migration (if needed)
-- DROP POLICY IF EXISTS "Users can create their own companies" ON companies;
-- ALTER TABLE companies DROP CONSTRAINT IF EXISTS companies_user_id_key;
