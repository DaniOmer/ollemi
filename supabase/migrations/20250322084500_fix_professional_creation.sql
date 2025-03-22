-- Migration: Fix professional creation
-- Description: Ensures the professionals table exists and fixes the trigger function for professional creation

-- Up Migration

-- 1. First, make sure the professionals table exists with the correct structure
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'professionals') THEN
        CREATE TABLE professionals (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
            business_name TEXT NOT NULL,
            description TEXT,
            address TEXT,
            city TEXT,
            zipcode TEXT,
            phone TEXT,
            website TEXT,
            instagram TEXT,
            facebook TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ,
            UNIQUE(user_id)
        );

        -- RLS Policies for professionals
        ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Professionals can view their own data" ON professionals
            FOR SELECT USING (auth.uid() = user_id);
        CREATE POLICY "Professionals can update their own data" ON professionals
            FOR UPDATE USING (auth.uid() = user_id);
        CREATE POLICY "Anyone can view professionals" ON professionals
            FOR SELECT USING (true);
    END IF;
END
$$;

-- 2. Create a separate function specifically for professional creation
CREATE OR REPLACE FUNCTION public.create_professional_record(user_record RECORD)
RETURNS VOID AS $$
BEGIN
    -- This function will be called from the handle_new_user function
    -- when a user with role 'pro' is created
    INSERT INTO professionals (
        user_id,
        business_name,
        phone,
        created_at
    )
    VALUES (
        user_record.id,
        COALESCE(
            CONCAT(
                user_record.first_name, 
                ' ', 
                user_record.last_name
            ), 
            'Professional'
        ),
        user_record.phone,
        NOW()
    );
    
EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error in create_professional_record for user ID: %. Error: %', user_record.id, SQLERRM;
    -- We don't re-raise the exception to prevent the transaction from failing
    -- This way, the user is still created even if the professional record fails
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Update the handle_new_user function to use the new create_professional_record function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role TEXT;
    user_id UUID;
    user_record RECORD;
BEGIN
    -- Get the role from the raw_user_meta_data
    BEGIN
        user_role := COALESCE(new.raw_user_meta_data->>'role', 'client');
        RAISE LOG 'Creating new user with ID: %, Email: %, Role: %', new.id, new.email, user_role;
        
        -- Log the metadata for debugging
        RAISE LOG 'User metadata: %', new.raw_user_meta_data;
    EXCEPTION WHEN OTHERS THEN
        RAISE LOG 'Error extracting role from metadata: %', SQLERRM;
        user_role := 'client'; -- Default to client if there's an error
    END;
    
    -- Insert into users table with error handling
    BEGIN
        INSERT INTO public.users (
            id, 
            email, 
            first_name, 
            last_name, 
            phone, 
            role, 
            accept_terms
        )
        VALUES (
            new.id, 
            new.email, 
            new.raw_user_meta_data->>'first_name', 
            new.raw_user_meta_data->>'last_name', 
            new.raw_user_meta_data->>'phone', 
            user_role, 
            COALESCE((new.raw_user_meta_data->>'accept_terms')::boolean, FALSE)
        )
        RETURNING id INTO user_id;
        
        RAISE LOG 'Successfully created user record for ID: %', user_id;
    EXCEPTION WHEN OTHERS THEN
        RAISE LOG 'Error creating user record for ID: %. Error: %', new.id, SQLERRM;
        -- Re-raise the exception to prevent the transaction from completing
        -- This will cause the auth.users insert to roll back as well
        RAISE EXCEPTION 'Failed to create user record: %', SQLERRM;
    END;
    
    -- If the user role is 'pro', also create a professional record
    IF user_role = 'pro' THEN
        RAISE LOG 'Creating professional record for user ID: %', user_id;
        
        BEGIN
            -- Get the user record we just created
            SELECT * INTO user_record FROM public.users WHERE id = user_id;
            
            -- Call the separate function to create the professional record
            PERFORM create_professional_record(user_record);
            
            RAISE LOG 'Successfully created professional record for user ID: %', user_id;
        EXCEPTION WHEN OTHERS THEN
            RAISE LOG 'Error creating professional record for user ID: %. Error: %', user_id, SQLERRM;
            -- We continue execution even if professional creation fails
        END;
    END IF;
    
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create a direct SQL function to create a professional record for existing users
CREATE OR REPLACE FUNCTION public.create_professional_for_existing_user(user_id UUID)
RETURNS VOID AS $$
DECLARE
    user_record RECORD;
BEGIN
    -- Get the user record
    SELECT * INTO user_record FROM public.users WHERE id = user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User with ID % not found', user_id;
    END IF;
    
    -- Check if a professional record already exists
    IF EXISTS (SELECT 1 FROM professionals WHERE user_id = user_record.id) THEN
        RAISE EXCEPTION 'Professional record already exists for user ID %', user_id;
    END IF;
    
    -- Create the professional record
    INSERT INTO professionals (
        user_id,
        business_name,
        phone,
        created_at
    )
    VALUES (
        user_record.id,
        COALESCE(
            CONCAT(
                user_record.first_name, 
                ' ', 
                user_record.last_name
            ), 
            'Professional'
        ),
        user_record.phone,
        NOW()
    );
    
    -- Update the user role if it's not already 'pro'
    IF user_record.role != 'pro' THEN
        UPDATE public.users SET role = 'pro' WHERE id = user_id;
    END IF;
    
    RAISE LOG 'Successfully created professional record for existing user ID: %', user_id;
EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error creating professional record for existing user ID: %. Error: %', user_id, SQLERRM;
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Down Migration
-- Restore the previous version of the function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Get the role from the raw_user_meta_data
  BEGIN
    user_role := COALESCE(new.raw_user_meta_data->>'role', 'client');
    RAISE LOG 'Creating new user with ID: %, Email: %, Role: %', new.id, new.email, user_role;
    
    -- Log the metadata for debugging
    RAISE LOG 'User metadata: %', new.raw_user_meta_data;
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error extracting role from metadata: %', SQLERRM;
    user_role := 'client'; -- Default to client if there's an error
  END;
  
  -- Insert into users table with error handling
  BEGIN
    INSERT INTO public.users (
      id, 
      email, 
      first_name, 
      last_name, 
      phone, 
      role, 
      accept_terms
    )
    VALUES (
      new.id, 
      new.email, 
      new.raw_user_meta_data->>'first_name', 
      new.raw_user_meta_data->>'last_name', 
      new.raw_user_meta_data->>'phone', 
      user_role, 
      COALESCE((new.raw_user_meta_data->>'accept_terms')::boolean, FALSE)
    );
    RAISE LOG 'Successfully created user record for ID: %', new.id;
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error creating user record for ID: %. Error: %', new.id, SQLERRM;
    -- Re-raise the exception to prevent the transaction from completing
    -- This will cause the auth.users insert to roll back as well
    RAISE EXCEPTION 'Failed to create user record: %', SQLERRM;
  END;
  
  -- If the user role is 'pro', also create a professional record
  IF user_role = 'pro' THEN
    RAISE LOG 'Creating professional record for user ID: %', new.id;
    
    BEGIN
      INSERT INTO professionals (
        user_id,
        business_name,
        phone,
        created_at
      )
      VALUES (
        new.id,
        COALESCE(
          CONCAT(
            new.raw_user_meta_data->>'first_name', 
            ' ', 
            new.raw_user_meta_data->>'last_name'
          ), 
          'Professional'
        ),
        new.raw_user_meta_data->>'phone',
        NOW()
      );
      RAISE LOG 'Successfully created professional record for user ID: %', new.id;
    EXCEPTION WHEN OTHERS THEN
      RAISE LOG 'Error creating professional record for user ID: %. Error: %', new.id, SQLERRM;
      -- Continue execution even if professional creation fails
      -- We don't want to prevent user creation if only the professional part fails
    END;
  END IF;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the additional functions
DROP FUNCTION IF EXISTS public.create_professional_record(RECORD);
DROP FUNCTION IF EXISTS public.create_professional_for_existing_user(UUID);
