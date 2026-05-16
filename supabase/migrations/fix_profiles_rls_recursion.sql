-- Fix infinite recursion in profiles RLS policies
-- The old "owner reads all profiles" policy caused recursion by querying profiles table within a profiles policy

-- Drop all existing profiles policies
DROP POLICY IF EXISTS "users read own profile" ON profiles;
DROP POLICY IF EXISTS "users update own profile" ON profiles;
DROP POLICY IF EXISTS "owner reads all profiles" ON profiles;
DROP POLICY IF EXISTS "owner updates all profiles" ON profiles;

-- Create a security definer function to get current user's role WITHOUT triggering RLS
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;

-- Re-create policies using the function (no recursion since function is SECURITY DEFINER)
CREATE POLICY "users read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "owner reads all profiles" ON profiles
  FOR SELECT USING (get_my_role() = 'owner');

CREATE POLICY "owner updates all profiles" ON profiles
  FOR ALL USING (get_my_role() = 'owner');
