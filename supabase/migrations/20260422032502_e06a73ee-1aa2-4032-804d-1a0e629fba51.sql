ALTER TABLE public.coupons 
ADD COLUMN IF NOT EXISTS applies_to text NOT NULL DEFAULT 'all',
ADD COLUMN IF NOT EXISTS product_ids uuid[] DEFAULT '{}'::uuid[];