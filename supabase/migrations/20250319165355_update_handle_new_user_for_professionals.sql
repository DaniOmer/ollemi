-- Migration: Update handle_new_user function for professionals
-- Description: Modifies the handle_new_user function to automatically add a row to the professionals table when a user with role 'pro' is created

-- Up Migration
-- Update the existing handle_new_user function to also create a professional record when appropriate
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

-- Down Migration
-- Restore the original handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
    COALESCE(new.raw_user_meta_data->>'role', 'client'), 
    COALESCE((new.raw_user_meta_data->>'accept_terms')::boolean, FALSE)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
