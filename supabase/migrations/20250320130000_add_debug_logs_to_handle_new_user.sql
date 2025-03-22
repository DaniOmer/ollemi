-- Migration: Add debug logs to handle_new_user function
-- Description: Adds logging to help debug the professional creation process

-- Up Migration
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

-- Down Migration
-- Restore the original function without logging
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Get the role from the raw_user_meta_data
  user_role := COALESCE(new.raw_user_meta_data->>'role', 'client');
  
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
  END IF;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 