/*
  # Create Admin Account

  1. New Admin User
    - Creates admin user in auth.users table
    - Creates corresponding profile in profiles table
    - Email: admin@admin.com
    - Password: 123456
    - Role: admin

  2. Security
    - Uses proper password hashing
    - Handles duplicate prevention with conditional logic
*/

-- Create admin user only if it doesn't exist
DO $$
DECLARE
  admin_user_id uuid;
  user_exists boolean := false;
BEGIN
  -- Check if admin user already exists
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'admin@admin.com') INTO user_exists;
  
  IF NOT user_exists THEN
    -- Generate a new UUID for the admin user
    admin_user_id := gen_random_uuid();
    
    -- Insert admin user into auth.users table
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      role,
      aud,
      confirmation_token,
      email_change_token_new,
      recovery_token
    ) VALUES (
      admin_user_id,
      '00000000-0000-0000-0000-000000000000',
      'admin@admin.com',
      crypt('123456', gen_salt('bf')),
      now(),
      now(),
      now(),
      'authenticated',
      'authenticated',
      '',
      '',
      ''
    );
  ELSE
    -- Get existing admin user ID
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@admin.com';
  END IF;
  
  -- Insert or update admin profile
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
  ) ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    must_change_password = EXCLUDED.must_change_password;
    
END $$;