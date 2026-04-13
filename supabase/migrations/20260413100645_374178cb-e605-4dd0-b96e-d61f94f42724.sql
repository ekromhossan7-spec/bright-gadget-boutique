CREATE POLICY "Public can view orders by order_number"
ON public.orders
FOR SELECT
TO anon
USING (true);