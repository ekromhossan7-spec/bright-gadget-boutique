
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Orders require user or guest info" ON public.orders;

-- Authenticated users can only see their own orders
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- INSERT: logged-in users must use their own ID, guests must have null user_id
CREATE POLICY "Secure order creation" ON public.orders
  FOR INSERT WITH CHECK (
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR
    (auth.uid() IS NULL AND user_id IS NULL AND (guest_email IS NOT NULL OR guest_phone IS NOT NULL))
  );
