-- Enable aggregate functions
-- This is a workaround to enable aggregate functions in Supabase
-- https://supabase.com/blog/postgrest-aggregate-functions#staying-safe-with-aggregate-functions
ALTER ROLE authenticator SET pgrst.db_aggregates_enabled = 'true';
ALTER ROLE anon SET pgrst.db_aggregates_enabled = 'true';
NOTIFY pgrst, 'reload config';
