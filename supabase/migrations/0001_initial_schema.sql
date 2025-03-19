-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (will be managed by Supabase Auth)
-- Supabase Auth will create a 'auth.users' table automatically
-- This is our custom users table that extends the auth.users table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  role TEXT CHECK (role IN ('pro', 'client')) NOT NULL DEFAULT 'client',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- RLS Policies for users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Professionals table
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

-- Services table
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pro_id UUID REFERENCES professionals(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- RLS Policies for services
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Professionals can manage their own services" ON services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM professionals p 
      WHERE p.id = services.pro_id AND p.user_id = auth.uid()
    )
  );
CREATE POLICY "Anyone can view services" ON services
  FOR SELECT USING (true);

-- Photos table
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pro_id UUID REFERENCES professionals(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  alt TEXT,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- RLS Policies for photos
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Professionals can manage their own photos" ON photos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM professionals p 
      WHERE p.id = photos.pro_id AND p.user_id = auth.uid()
    )
  );
CREATE POLICY "Anyone can view photos" ON photos
  FOR SELECT USING (true);

-- Opening Hours table
CREATE TABLE opening_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pro_id UUID REFERENCES professionals(id) ON DELETE CASCADE NOT NULL,
  day_of_week TEXT CHECK (day_of_week IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')) NOT NULL,
  open BOOLEAN DEFAULT true,
  start_time TIME,
  end_time TIME,
  break_start_time TIME,
  break_end_time TIME,
  UNIQUE(pro_id, day_of_week)
);

-- RLS Policies for opening_hours
ALTER TABLE opening_hours ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Professionals can manage their own opening hours" ON opening_hours
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM professionals p 
      WHERE p.id = opening_hours.pro_id AND p.user_id = auth.uid()
    )
  );
CREATE POLICY "Anyone can view opening hours" ON opening_hours
  FOR SELECT USING (true);

-- Appointments table
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pro_id UUID REFERENCES professionals(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES users(id) ON DELETE SET NULL,
  client_email TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')) NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- RLS Policies for appointments
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Professionals can view their appointments" ON appointments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM professionals p 
      WHERE p.id = appointments.pro_id AND p.user_id = auth.uid()
    )
  );
CREATE POLICY "Professionals can update their appointments" ON appointments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM professionals p 
      WHERE p.id = appointments.pro_id AND p.user_id = auth.uid()
    )
  );
CREATE POLICY "Clients can view their appointments" ON appointments
  FOR SELECT USING (
    client_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.email = appointments.client_email
    )
  );
CREATE POLICY "Clients can create appointments" ON appointments
  FOR INSERT WITH CHECK (true);
  
-- Create function for checking appointment availability
CREATE OR REPLACE FUNCTION check_appointment_availability(
  p_pro_id UUID,
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
    WHERE a.pro_id = p_pro_id
      AND a.status != 'cancelled'
      AND (
        (a.start_time, a.end_time) OVERLAPS (p_start_time, p_end_time)
      )
  ) INTO has_conflict;
  
  RETURN NOT has_conflict;
END;
$$ LANGUAGE plpgsql;

-- Create function to check if a time slot is within opening hours
CREATE OR REPLACE FUNCTION is_within_opening_hours(
  p_pro_id UUID,
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
    oh.pro_id = p_pro_id AND 
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
