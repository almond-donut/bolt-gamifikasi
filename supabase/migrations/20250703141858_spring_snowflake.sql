/*
  # Create Admin User Account

  1. Creates admin user in auth.users table
  2. Creates corresponding profile in profiles table
  3. Uses proper error handling to avoid duplicates
*/

-- Create admin user with proper auth setup
DO $$
DECLARE
  admin_user_id uuid;
  user_exists boolean := false;
BEGIN
  -- Check if admin user already exists in auth.users
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'admin@admin.com') INTO user_exists;
  
  IF NOT user_exists THEN
    -- Generate a UUID for the admin user
    admin_user_id := gen_random_uuid();
    
    -- Insert into auth.users first
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      role,
      aud
    ) VALUES (
      admin_user_id,
      '00000000-0000-0000-0000-000000000000',
      'admin@admin.com',
      crypt('123456', gen_salt('bf')),
      now(),
      now(),
      now(),
      'authenticated',
      'authenticated'
    );
    
    -- Then insert the profile
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
    
    RAISE NOTICE 'Admin user created successfully with email: admin@admin.com';
  ELSE
    RAISE NOTICE 'Admin user already exists';
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creating admin user: %', SQLERRM;
END $$;