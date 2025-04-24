-- Description: This migration alters the users table RLS to allow select from user with pro role

-- Up Migration
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select from user with pro role" ON users
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM users
            WHERE users.role = 'pro'
        )
    );

-- Down Migration
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;
-- DROP POLICY "Allow select from user with pro role" ON users;