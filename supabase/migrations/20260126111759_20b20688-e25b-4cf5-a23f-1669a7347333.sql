-- Drop existing SELECT policy on profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create new policy that explicitly requires authentication AND restricts to own profile
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() IS NOT NULL AND auth.uid() = id);