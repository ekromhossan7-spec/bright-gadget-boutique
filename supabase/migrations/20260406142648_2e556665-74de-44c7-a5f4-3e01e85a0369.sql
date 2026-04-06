
-- Admin can INSERT products
CREATE POLICY "Admins can insert products"
ON public.products FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admin can UPDATE products
CREATE POLICY "Admins can update products"
ON public.products FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admin can DELETE products
CREATE POLICY "Admins can delete products"
ON public.products FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can manage categories
CREATE POLICY "Admins can insert categories"
ON public.categories FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update categories"
ON public.categories FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete categories"
ON public.categories FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can manage site_settings
CREATE POLICY "Admins can update site_settings"
ON public.site_settings FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert site_settings"
ON public.site_settings FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admin can manage reviews
CREATE POLICY "Admins can update reviews"
ON public.reviews FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete reviews"
ON public.reviews FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can view all reviews (including unapproved)
CREATE POLICY "Admins can view all reviews"
ON public.reviews FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
