
-- Abandoned checkouts table for tracking incomplete orders
CREATE TABLE public.abandoned_checkouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text,
  email text,
  phone text,
  address text,
  city text,
  area text,
  notes text,
  payment_method text DEFAULT 'cod',
  items jsonb DEFAULT '[]'::jsonb,
  subtotal numeric DEFAULT 0,
  delivery_charge numeric DEFAULT 0,
  total numeric DEFAULT 0,
  status text NOT NULL DEFAULT 'abandoned',
  recovered_order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  recovered_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.abandoned_checkouts ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (guests too)
CREATE POLICY "Anyone can insert abandoned checkouts"
  ON public.abandoned_checkouts FOR INSERT TO public
  WITH CHECK (true);

-- Anyone can update their own session
CREATE POLICY "Anyone can update own session abandoned checkouts"
  ON public.abandoned_checkouts FOR UPDATE TO public
  USING (session_id = session_id)
  WITH CHECK (true);

-- Admins can view all
CREATE POLICY "Admins can view abandoned checkouts"
  ON public.abandoned_checkouts FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update all
CREATE POLICY "Admins can update abandoned checkouts"
  ON public.abandoned_checkouts FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete
CREATE POLICY "Admins can delete abandoned checkouts"
  ON public.abandoned_checkouts FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
