/*
  # Fix Authentication Schema Error

  1. Problem Analysis
    - Supabase authentication is failing with "Database error querying schema"
    - The profiles table has a foreign key to auth.users that may be causing issues
    - RLS policies might be too restrictive for Supabase's internal operations

  2. Solution
    - Temporarily drop and recreate the foreign key constraint with proper configuration
    - Ensure RLS policies allow Supabase's internal authentication service to function
    - Add a policy to allow the authentication service to read profiles during login

  3. Changes
    - Drop existing foreign key constraint
    - Recreate foreign key with proper CASCADE behavior
    - Add service role policy for authentication operations
    - Ensure profiles can be created during user registration
*/

-- Drop the existing foreign key constraint that might be causing issues
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Recreate the foreign key constraint with explicit reference to auth.users
ALTER TABLE profiles 
ADD CONSTRAINT profiles_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add a policy to allow service role (used by Supabase internally) to manage profiles
CREATE POLICY "Service role can manage profiles"
  ON profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add a policy to allow authenticated users to insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Add a policy to allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Ensure the profiles table has proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);