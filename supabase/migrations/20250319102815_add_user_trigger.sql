-- Migration: Add user triggers for auth synchronization
-- Description: Creates triggers to keep public.users table in sync with auth.users

-- Up Migration
-- Create a function that automatically creates a record in our users table
-- when a new user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger that calls this function whenever a user is created in auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update user data when their email changes in auth
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET email = new.email, updated_at = now()
  WHERE id = new.id;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger for when users update their email in auth
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW 
  WHEN (old.email IS DISTINCT FROM new.email)
  EXECUTE FUNCTION public.handle_user_update();

-- Down Migration (commented out, uncomment to revert)
-- DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
-- DROP FUNCTION IF EXISTS public.handle_user_update();
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- DROP FUNCTION IF EXISTS public.handle_new_user();
