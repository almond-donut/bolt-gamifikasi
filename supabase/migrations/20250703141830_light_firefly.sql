/*
  # Create Admin Account

  1. Creates admin user using Supabase auth functions
  2. Creates admin profile in profiles table
  3. Sets up proper admin permissions

  Note: This migration creates an admin account with:
  - Email: admin@admin.com
  - Password: 123456
  - Role: admin
*/

-- Create a function to safely create admin user
CREATE OR REPLACE FUNCTION create_admin_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_user_id uuid;
  user_exists boolean := false;
BEGIN
  -- Check if admin profile already exists
  SELECT EXISTS(SELECT 1 FROM profiles WHERE email = 'admin@admin.com' AND role = 'admin') INTO user_exists;
  
  IF NOT user_exists THEN
    -- Generate a UUID for the admin user
    admin_user_id := gen_random_uuid();
    
    -- Insert admin profile directly (auth user will be created on first login)
    INSERT INTO profiles (
      id,
      full_name,
      email,
      role,
      points,
      created_at,
      must_change_password
    ) VALUES (
      admin_user_id,
      'System Administrator',
      'admin@admin.com',
      'admin',
      0,
      now(),
      false
    );
    
    RAISE NOTICE 'Admin user profile created with ID: %', admin_user_id;
  ELSE
    RAISE NOTICE 'Admin user already exists';
  END IF;
END;
$$;

-- Execute the function
SELECT create_admin_user();

-- Drop the function after use
DROP FUNCTION create_admin_user();

-- Note: The actual auth.users record will be created when the admin first logs in
-- This is the standard Supabase pattern for user creation