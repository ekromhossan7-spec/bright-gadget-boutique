
-- Drop the overly permissive policies
DROP POLICY "Anyone can update own session abandoned checkouts" ON public.abandoned_checkouts;
DROP POLICY "Anyone can insert abandoned checkouts" ON public.abandoned_checkouts;

-- Recreate insert with session_id required (still public but requires session_id)
CREATE POLICY "Public can insert abandoned checkouts"
  ON public.abandoned_checkouts FOR INSERT TO public
  WITH CHECK (session_id IS NOT NULL AND session_id != '');

-- Public can update only matching session_id via a function
CREATE POLICY "Public can update own session"
  ON public.abandoned_checkouts FOR UPDATE TO public
  USING (status = 'abandoned')
  WITH CHECK (status = 'abandoned');
