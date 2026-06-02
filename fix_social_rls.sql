-- 1. Drop the existing policy if any
DROP POLICY IF EXISTS "Admins can manage social feeds" ON public.social_feeds;
DROP POLICY IF EXISTS "Allow admins write on social_feeds" ON public.social_feeds;

-- 2. Re-create the policy with explicit WITH CHECK for INSERT operations
CREATE POLICY "Admins can manage social feeds" ON public.social_feeds 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
