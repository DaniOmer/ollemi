-- Migration: Add company_id to users table
-- Description: Adds company_id to users table and updates company creation logic

-- Up Migration

-- 1. Add company_id to users table
ALTER TABLE users
ADD COLUMN company_id UUID REFERENCES companies(id) ON DELETE SET NULL;

-- 2. Add bidirectional relationship between users and companies
CREATE OR REPLACE FUNCTION public.update_user_company_id()
RETURNS TRIGGER AS $$
BEGIN
  -- When a company is created or updated, set the company_id for the associated user
  UPDATE users
  SET company_id = NEW.id
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to update user's company_id when a company is created or updated
CREATE TRIGGER update_user_company_id_trigger
AFTER INSERT OR UPDATE ON companies
FOR EACH ROW
EXECUTE FUNCTION public.update_user_company_id();

-- 3. Update existing users with company_id based on existing companies
UPDATE users u
SET company_id = c.id
FROM companies c
WHERE u.id = c.user_id;

-- 4. First drop the existing function, then recreate it with the new return type
DROP FUNCTION IF EXISTS public.create_company_record(RECORD);

-- Now recreate with UUID return type
CREATE OR REPLACE FUNCTION public.create_company_record(user_record RECORD)
RETURNS UUID AS $$
DECLARE
  company_id UUID;
BEGIN
  -- This function will be called from the handle_new_user function
  -- when a user with role 'pro' is created
  INSERT INTO companies (
    user_id,
    name,
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
      'Company'
    ),
    user_record.phone,
    NOW()
  )
  RETURNING id INTO company_id;
  
  -- The trigger will handle setting the company_id in the users table
  
  RETURN company_id;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'Error in create_company_record for user ID: %. Error: %', user_record.id, SQLERRM;
  -- We don't re-raise the exception to prevent the transaction from failing
  -- This way, the user is still created even if the company record fails
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Update the handle_new_user function to use the updated create_company_record function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
  user_id UUID;
  company_id UUID;
  user_record RECORD;
  onboarding_completed BOOLEAN;
BEGIN
  -- Get the role from the raw_user_meta_data
  BEGIN
    user_role := COALESCE(new.raw_user_meta_data->>'role', 'client');
    onboarding_completed := COALESCE((new.raw_user_meta_data->>'onboarding_completed')::boolean, user_role != 'pro');
    RAISE LOG 'Creating new user with ID: %, Email: %, Role: %, Onboarding: %', new.id, new.email, user_role, onboarding_completed;
    
    -- Log the metadata for debugging
    RAISE LOG 'User metadata: %', new.raw_user_meta_data;
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error extracting role from metadata: %', SQLERRM;
    user_role := 'client'; -- Default to client if there's an error
    onboarding_completed := TRUE;
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
      accept_terms,
      onboarding_completed
    )
    VALUES (
      new.id, 
      new.email, 
      new.raw_user_meta_data->>'first_name', 
      new.raw_user_meta_data->>'last_name', 
      new.raw_user_meta_data->>'phone', 
      user_role, 
      COALESCE((new.raw_user_meta_data->>'accept_terms')::boolean, FALSE),
      onboarding_completed
    )
    RETURNING id INTO user_id;
    
    RAISE LOG 'Successfully created user record for ID: %', user_id;
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error creating user record for ID: %. Error: %', new.id, SQLERRM;
    -- Re-raise the exception to prevent the transaction from completing
    -- This will cause the auth.users insert to roll back as well
    RAISE EXCEPTION 'Failed to create user record: %', SQLERRM;
  END;
  
  -- If the user role is 'pro', also create a company record
  IF user_role = 'pro' THEN
    RAISE LOG 'Creating company record for user ID: %', user_id;
    
    BEGIN
      -- Get the user record we just created
      SELECT * INTO user_record FROM public.users WHERE id = user_id;
      
      -- Call the separate function to create the company record
      company_id := create_company_record(user_record);
      
      IF company_id IS NOT NULL THEN
        RAISE LOG 'Successfully created company record (ID: %) for user ID: %', company_id, user_id;
      ELSE
        RAISE LOG 'Failed to create company record for user ID: %', user_id;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RAISE LOG 'Error creating company record for user ID: %. Error: %', user_id, SQLERRM;
      -- We continue execution even if company creation fails
    END;
  END IF;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. First drop the existing function, then recreate it with the new return type
DROP FUNCTION IF EXISTS public.create_company_for_existing_user(UUID);

-- Now recreate with UUID return type
CREATE OR REPLACE FUNCTION public.create_company_for_existing_user(user_id UUID)
RETURNS UUID AS $$
DECLARE
  user_record RECORD;
  company_id UUID;
BEGIN
  -- Get the user record
  SELECT * INTO user_record FROM public.users WHERE id = user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User with ID % not found', user_id;
  END IF;
  
  -- Check if a company record already exists
  IF EXISTS (SELECT 1 FROM companies WHERE user_id = user_record.id) THEN
    -- Return the existing company ID
    SELECT id INTO company_id FROM companies WHERE user_id = user_record.id;
    RETURN company_id;
  END IF;
  
  -- Create the company record
  INSERT INTO companies (
    user_id,
    name,
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
      'Company'
    ),
    user_record.phone,
    NOW()
  )
  RETURNING id INTO company_id;
  
  -- Update the user role if it's not already 'pro'
  IF user_record.role != 'pro' THEN
    UPDATE public.users SET role = 'pro' WHERE id = user_id;
  END IF;
  
  RAISE LOG 'Successfully created company record (ID: %) for existing user ID: %', company_id, user_id;
  RETURN company_id;
  
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'Error creating company record for existing user ID: %. Error: %', user_id, SQLERRM;
  RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Down Migration (if needed)
-- ALTER TABLE users DROP COLUMN company_id;
-- DROP TRIGGER IF EXISTS update_user_company_id_trigger ON companies;
-- DROP FUNCTION IF EXISTS public.update_user_company_id(); 