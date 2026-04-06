ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS consignment_id text,
  ADD COLUMN IF NOT EXISTS tracking_code text,
  ADD COLUMN IF NOT EXISTS courier_status text;