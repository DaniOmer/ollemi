-- Migration: Improve handle_new_user error handling
-- Description: Adds comprehensive error handling to the handle_new_user function

-- Up Migration
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

-- Down Migration
-- Restore the previous version of the function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Get the role from the raw_user_meta_data
  user_role := COALESCE(new.raw_user_meta_data->>'role', 'client');
  
  -- Log the user creation attempt
  RAISE LOG 'Creating new user with ID: %, Role: %', new.id, user_role;
  
  -- Insert into users table
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
    END;
  END IF;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
