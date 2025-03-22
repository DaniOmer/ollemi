-- Migration: Replace professionals with companies
-- Description: Creates a companies table and updates related logic

-- Up Migration

-- 1. Create the companies table
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
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

-- RLS Policies for companies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Companies can view their own data" ON companies
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Companies can update their own data" ON companies
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view companies" ON companies
  FOR SELECT USING (true);

-- 2. Update services table to reference companies instead of professionals
ALTER TABLE services
  DROP CONSTRAINT services_pro_id_fkey;

ALTER TABLE services
  RENAME COLUMN pro_id TO company_id;

ALTER TABLE services
  ADD CONSTRAINT services_company_id_fkey
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

-- 3. Update photos table to reference companies instead of professionals
ALTER TABLE photos
  DROP CONSTRAINT photos_pro_id_fkey;

ALTER TABLE photos
  RENAME COLUMN pro_id TO company_id;

ALTER TABLE photos
  ADD CONSTRAINT photos_company_id_fkey
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

-- 4. Update opening_hours table to reference companies instead of professionals
ALTER TABLE opening_hours
  DROP CONSTRAINT opening_hours_pro_id_fkey;

ALTER TABLE opening_hours
  RENAME COLUMN pro_id TO company_id;

ALTER TABLE opening_hours
  ADD CONSTRAINT opening_hours_company_id_fkey
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

-- 5. Update appointments table to reference companies instead of professionals
ALTER TABLE appointments
  DROP CONSTRAINT appointments_pro_id_fkey;

ALTER TABLE appointments
  RENAME COLUMN pro_id TO company_id;

ALTER TABLE appointments
  ADD CONSTRAINT appointments_company_id_fkey
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

-- 6. Update RLS policies for services
DROP POLICY IF EXISTS "Professionals can manage their own services" ON services;
CREATE POLICY "Companies can manage their own services" ON services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM companies c 
      WHERE c.id = services.company_id AND c.user_id = auth.uid()
    )
  );

-- 7. Update RLS policies for photos
DROP POLICY IF EXISTS "Professionals can manage their own photos" ON photos;
CREATE POLICY "Companies can manage their own photos" ON photos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM companies c 
      WHERE c.id = photos.company_id AND c.user_id = auth.uid()
    )
  );

-- 8. Update RLS policies for opening_hours
DROP POLICY IF EXISTS "Professionals can manage their own opening hours" ON opening_hours;
CREATE POLICY "Companies can manage their own opening hours" ON opening_hours
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM companies c 
      WHERE c.id = opening_hours.company_id AND c.user_id = auth.uid()
    )
  );

-- 9. Update RLS policies for appointments
DROP POLICY IF EXISTS "Professionals can view their appointments" ON appointments;
CREATE POLICY "Companies can view their appointments" ON appointments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM companies c 
      WHERE c.id = appointments.company_id AND c.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Professionals can update their appointments" ON appointments;
CREATE POLICY "Companies can update their appointments" ON appointments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM companies c 
      WHERE c.id = appointments.company_id AND c.user_id = auth.uid()
    )
  );

-- 10. Update functions that check appointment availability
-- First drop the existing function
DROP FUNCTION IF EXISTS check_appointment_availability;

-- Then recreate it with the new parameter names
CREATE FUNCTION check_appointment_availability(
  p_company_id UUID,
  p_start_time TIMESTAMPTZ,
  p_end_time TIMESTAMPTZ
) RETURNS BOOLEAN AS $$
DECLARE
  has_conflict BOOLEAN;
BEGIN
  -- Check if there's any overlap with existing appointments
  SELECT EXISTS (
    SELECT 1 
    FROM appointments a
    WHERE a.company_id = p_company_id
      AND a.status != 'cancelled'
      AND (
        (a.start_time, a.end_time) OVERLAPS (p_start_time, p_end_time)
      )
  ) INTO has_conflict;
  
  RETURN NOT has_conflict;
END;
$$ LANGUAGE plpgsql;

-- 11. Update function to check if a time slot is within opening hours
-- First drop the existing function
DROP FUNCTION IF EXISTS is_within_opening_hours;

-- Then recreate it with the new parameter names
CREATE FUNCTION is_within_opening_hours(
  p_company_id UUID,
  p_start_time TIMESTAMPTZ,
  p_end_time TIMESTAMPTZ
) RETURNS BOOLEAN AS $$
DECLARE
  day_name TEXT;
  opening_start TIME;
  opening_end TIME;
  break_start TIME;
  break_end TIME;
  is_open BOOLEAN;
  start_time_only TIME;
  end_time_only TIME;
BEGIN
  -- Get day of week in lowercase
  day_name := LOWER(TO_CHAR(p_start_time AT TIME ZONE 'UTC', 'day'));
  day_name := TRIM(day_name);
  
  -- Get opening hours for this day
  SELECT 
    oh.open,
    oh.start_time,
    oh.end_time,
    oh.break_start_time,
    oh.break_end_time
  INTO 
    is_open,
    opening_start,
    opening_end,
    break_start,
    break_end
  FROM 
    opening_hours oh
  WHERE 
    oh.company_id = p_company_id AND 
    oh.day_of_week = day_name;
  
  -- If no records or closed, return false
  IF is_open IS NULL OR NOT is_open THEN
    RETURN FALSE;
  END IF;
  
  -- Extract time portion only
  start_time_only := p_start_time::TIME;
  end_time_only := p_end_time::TIME;
  
  -- Check if appointment is within opening hours
  IF start_time_only < opening_start OR end_time_only > opening_end THEN
    RETURN FALSE;
  END IF;
  
  -- Check if appointment overlaps with break time (if defined)
  IF break_start IS NOT NULL AND break_end IS NOT NULL THEN
    IF NOT ((end_time_only <= break_start) OR (start_time_only >= break_end)) THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 12. Create a function to create a company record for a user
CREATE OR REPLACE FUNCTION public.create_company_record(user_record RECORD)
RETURNS VOID AS $$
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
  );
    
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'Error in create_company_record for user ID: %. Error: %', user_record.id, SQLERRM;
  -- We don't re-raise the exception to prevent the transaction from failing
  -- This way, the user is still created even if the company record fails
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Update the handle_new_user function to use the new create_company_record function
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
  
  -- If the user role is 'pro', also create a company record
  IF user_role = 'pro' THEN
    RAISE LOG 'Creating company record for user ID: %', user_id;
    
    BEGIN
      -- Get the user record we just created
      SELECT * INTO user_record FROM public.users WHERE id = user_id;
      
      -- Call the separate function to create the company record
      PERFORM create_company_record(user_record);
      
      RAISE LOG 'Successfully created company record for user ID: %', user_id;
    EXCEPTION WHEN OTHERS THEN
      RAISE LOG 'Error creating company record for user ID: %. Error: %', user_id, SQLERRM;
      -- We continue execution even if company creation fails
    END;
  END IF;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. Create a direct SQL function to create a company record for existing users
CREATE OR REPLACE FUNCTION public.create_company_for_existing_user(user_id UUID)
RETURNS VOID AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Get the user record
  SELECT * INTO user_record FROM public.users WHERE id = user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User with ID % not found', user_id;
  END IF;
  
  -- Check if a company record already exists
  IF EXISTS (SELECT 1 FROM companies WHERE user_id = user_record.id) THEN
    RAISE EXCEPTION 'Company record already exists for user ID %', user_id;
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
  );
  
  -- Update the user role if it's not already 'pro'
  IF user_record.role != 'pro' THEN
    UPDATE public.users SET role = 'pro' WHERE id = user_id;
  END IF;
  
  RAISE LOG 'Successfully created company record for existing user ID: %', user_id;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'Error creating company record for existing user ID: %. Error: %', user_id, SQLERRM;
  RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 15. Migrate data from professionals to companies
INSERT INTO companies (
  id,
  user_id,
  name,
  description,
  address,
  city,
  zipcode,
  phone,
  website,
  instagram,
  facebook,
  created_at,
  updated_at
)
SELECT
  id,
  user_id,
  business_name,
  description,
  address,
  city,
  zipcode,
  phone,
  website,
  instagram,
  facebook,
  created_at,
  updated_at
FROM professionals;

-- Down Migration
-- This would restore the professionals table and related logic
-- Note: This is a destructive operation and would lose any new data in the companies table
-- It's recommended to backup data before running this migration
