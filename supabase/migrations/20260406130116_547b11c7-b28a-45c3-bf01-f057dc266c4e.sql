
-- Categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  image_url TEXT,
  description TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  short_description TEXT,
  price NUMERIC(10,2) NOT NULL,
  compare_price NUMERIC(10,2),
  category_id UUID REFERENCES public.categories(id),
  images TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  in_stock BOOLEAN DEFAULT true,
  stock_quantity INT DEFAULT 0,
  sku TEXT,
  tags TEXT[] DEFAULT '{}',
  specifications JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  email TEXT,
  avatar_url TEXT,
  address JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id),
  guest_email TEXT,
  guest_phone TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  delivery_charge NUMERIC(10,2) NOT NULL DEFAULT 0,
  partial_payment NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'cod',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  order_status TEXT NOT NULL DEFAULT 'pending',
  shipping_address JSONB NOT NULL DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  reviewer_name TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Site settings (for admin configurable content)
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT USING (true);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT WITH CHECK (true);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved reviews are viewable by everyone" ON public.reviews FOR SELECT USING (approved = true);
CREATE POLICY "Authenticated users can create reviews" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Site settings are viewable by everyone" ON public.site_settings FOR SELECT USING (true);
