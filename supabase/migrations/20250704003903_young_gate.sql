/*
  # Fix profiles table foreign key reference

  1. Changes
    - Drop the incorrect foreign key constraint that references a non-existent users table
    - Add the correct foreign key constraint that references auth.users table
    - This ensures the profiles table properly links to Supabase's built-in authentication system

  2. Security
    - Maintains existing RLS policies
    - No changes to existing permissions
*/

-- Drop the incorrect foreign key constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Add the correct foreign key constraint to reference auth.users
ALTER TABLE profiles ADD CONSTRAINT profiles_id_fkey 
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;