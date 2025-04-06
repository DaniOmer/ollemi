-- Alter opening_hours table to change day_of_week from TEXT to INTEGER
-- 0 = Sunday, 1 = Monday, 2 = Tuesday, etc. (following JavaScript Date.getDay() convention)

-- First, create a temporary column
ALTER TABLE opening_hours ADD COLUMN day_of_week_int INTEGER;

-- Update the temporary column with the correct values
UPDATE opening_hours SET day_of_week_int = 
  CASE day_of_week
    WHEN 'monday' THEN 1
    WHEN 'tuesday' THEN 2
    WHEN 'wednesday' THEN 3
    WHEN 'thursday' THEN 4
    WHEN 'friday' THEN 5
    WHEN 'saturday' THEN 6
    WHEN 'sunday' THEN 0
  END;

-- Drop the old constraint
ALTER TABLE opening_hours DROP CONSTRAINT opening_hours_day_of_week_check;

-- Drop the original column
ALTER TABLE opening_hours DROP COLUMN day_of_week;

-- Rename the temporary column to the original column name
ALTER TABLE opening_hours RENAME COLUMN day_of_week_int TO day_of_week;

-- Add a new constraint to ensure the day_of_week is between 0 and 6
ALTER TABLE opening_hours ADD CONSTRAINT opening_hours_day_of_week_check CHECK (day_of_week >= 0 AND day_of_week <= 6);

-- Make the column NOT NULL
ALTER TABLE opening_hours ALTER COLUMN day_of_week SET NOT NULL;

-- Update any functions that depend on the day_of_week format
CREATE OR REPLACE FUNCTION is_within_opening_hours(
  p_company_id UUID,
  p_start_time TIMESTAMPTZ,
  p_end_time TIMESTAMPTZ
) RETURNS BOOLEAN AS $$
DECLARE
  day_num INTEGER;
  opening_start TIME;
  opening_end TIME;
  break_start TIME;
  break_end TIME;
  is_open BOOLEAN;
  start_time_only TIME;
  end_time_only TIME;
BEGIN
  -- Get day of week as integer (0-6, Sunday is 0)
  day_num := EXTRACT(DOW FROM p_start_time AT TIME ZONE 'UTC');
  
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
    oh.day_of_week = day_num;
  
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
