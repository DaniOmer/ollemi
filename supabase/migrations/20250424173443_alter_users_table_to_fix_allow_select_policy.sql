-- Description: This migration alters the users table RLS to allow select from user

-- Up Migration
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
DROP POLICY "Allow select from user with pro role" ON users;

CREATE POLICY "Allow select from user" ON users
    FOR SELECT
    USING (
        TRUE
    );


-- Down Migration
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- DROP POLICY "Allow select from user with pro role" ON users;
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;