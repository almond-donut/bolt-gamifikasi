/*
  # Create Admin Account

  1. New Admin User
    - Creates admin user with email admin@admin.com
    - Sets password to 123456
    - Creates corresponding profile with admin role

  2. Security
    - Admin user will have full access to all features
    - Password can be changed after first login
*/

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
  gen_random_uuid(),
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
) ON CONFLICT (email) DO NOTHING;

-- Get the admin user ID
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@admin.com';
  
  -- Insert admin profile
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
    role = EXCLUDED.role;
END $$;