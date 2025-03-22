-- Add onboarding_completed field to users table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'users'
        AND column_name = 'onboarding_completed'
    ) THEN
        ALTER TABLE users ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
        
        -- Add comment to explain the field
        COMMENT ON COLUMN users.onboarding_completed IS 'Indicates whether the user has completed the onboarding process';
    END IF;
END
$$;

-- Update the handle_new_user function to set onboarding_completed to false for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    company_id UUID;
BEGIN
    -- Log the start of the function execution
    RAISE LOG 'handle_new_user function started for user_id: %', NEW.id;
    
    BEGIN
        -- Insert into public users table
        INSERT INTO public.users (
            id,
            email,
            role,
            first_name,
            last_name,
            phone,
            accept_terms,
            onboarding_completed
        )
        VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
            COALESCE(NEW.raw_user_meta_data->>'firstName', ''),
            COALESCE(NEW.raw_user_meta_data->>'lastName', ''),
            COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
            COALESCE((NEW.raw_user_meta_data->>'acceptTerms')::boolean, FALSE),
            FALSE -- Set onboarding_completed to false for new users
        );
        
        RAISE LOG 'User inserted into public.users table: %', NEW.id;
        
        -- If the user is a pro, create a company for them
        IF COALESCE(NEW.raw_user_meta_data->>'role', 'client') = 'pro' THEN
            RAISE LOG 'Creating company for pro user: %', NEW.id;
            
            -- Create a company for the pro user
            INSERT INTO public.companies (
                user_id,
                name,
                created_at,
                updated_at
            )
            VALUES (
                NEW.id,
                COALESCE(NEW.raw_user_meta_data->>'businessName', 'My Business'),
                NOW(),
                NOW()
            )
            RETURNING id INTO company_id;
            
            RAISE LOG 'Company created with ID: % for user: %', company_id, NEW.id;
            
            -- Update the user with the company_id
            UPDATE public.users
            SET company_id = company_id
            WHERE id = NEW.id;
            
            RAISE LOG 'User updated with company_id: % for user: %', company_id, NEW.id;
        END IF;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE LOG 'Error in handle_new_user: % %', SQLERRM, SQLSTATE;
    END;
    
    RAISE LOG 'handle_new_user function completed for user_id: %', NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
