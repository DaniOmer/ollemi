-- Migration: Update user trigger to include additional fields
-- Description: Updates the handle_new_user function to include first_name, last_name, phone, role, and accept_terms

-- Up Migration
-- Update the function that automatically creates a record in our users table
-- to include additional user metadata fields
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

-- Update the function to handle user updates
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET 
    email = new.email, 
    first_name = COALESCE(new.raw_user_meta_data->>'first_name', users.first_name),
    last_name = COALESCE(new.raw_user_meta_data->>'last_name', users.last_name),
    phone = COALESCE(new.raw_user_meta_data->>'phone', users.phone),
    role = COALESCE(new.raw_user_meta_data->>'role', users.role),
    accept_terms = COALESCE((new.raw_user_meta_data->>'accept_terms')::boolean, users.accept_terms),
    updated_at = now()
  WHERE id = new.id;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Down Migration (commented out, uncomment to revert)
-- Revert to the original functions
/*
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET email = new.email, updated_at = now()
  WHERE id = new.id;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
*/
