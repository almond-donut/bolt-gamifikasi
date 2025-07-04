/*
  # Fix Database Schema Issues

  1. Problem Analysis
    - Database schema error preventing authentication
    - Need to ensure proper foreign key relationships
    - Fix RLS policies and user creation triggers

  2. Solution
    - Create proper user creation trigger
    - Fix foreign key constraints using correct column names
    - Ensure all RLS policies are working
    - Add missing columns if needed

  3. Changes
    - Fix handle_new_user function and trigger
    - Correct foreign key constraint check
    - Recreate essential RLS policies
    - Add missing profile columns
*/

-- Create or replace the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'student')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Add missing columns if they don't exist
DO $$
BEGIN
  -- Add temp_password column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'temp_password'
  ) THEN
    ALTER TABLE profiles ADD COLUMN temp_password text;
  END IF;

  -- Add must_change_password column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'must_change_password'
  ) THEN
    ALTER TABLE profiles ADD COLUMN must_change_password boolean DEFAULT false;
  END IF;
END $$;

-- Fix foreign key constraint check using correct column names
DO $$
BEGIN
  -- Check if the profiles.id foreign key to auth.users exists using correct schema
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.referential_constraints rc
    JOIN information_schema.key_column_usage kcu_from 
      ON rc.constraint_name = kcu_from.constraint_name
    JOIN information_schema.key_column_usage kcu_to 
      ON rc.unique_constraint_name = kcu_to.constraint_name
    WHERE rc.constraint_schema = 'public'
    AND kcu_from.table_name = 'profiles'
    AND kcu_from.column_name = 'id'
    AND kcu_to.table_schema = 'auth'
    AND kcu_to.table_name = 'users'
  ) THEN
    -- Drop existing constraint if it exists with wrong configuration
    ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
    
    -- Add the correct foreign key constraint
    ALTER TABLE profiles 
    ADD CONSTRAINT profiles_id_fkey 
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN
    -- Constraint already exists, continue
    NULL;
  WHEN OTHERS THEN
    -- Log error but continue
    RAISE NOTICE 'Error setting up foreign key: %', SQLERRM;
END $$;

-- Ensure RLS is enabled on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Recreate essential RLS policies to ensure they're working correctly
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Ensure service role can manage profiles (critical for auth operations)
DROP POLICY IF EXISTS "Service role can manage profiles" ON profiles;
CREATE POLICY "Service role can manage profiles"
  ON profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Admin policies
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;
CREATE POLICY "Admins can manage all profiles"
  ON profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_class_id ON profiles(class_id);

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';