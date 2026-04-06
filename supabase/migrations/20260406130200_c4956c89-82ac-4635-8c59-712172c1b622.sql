
DROP POLICY "Anyone can create orders" ON public.orders;
CREATE POLICY "Orders require user or guest info" ON public.orders 
  FOR INSERT WITH CHECK (
    user_id IS NOT NULL OR guest_email IS NOT NULL OR guest_phone IS NOT NULL
  );
