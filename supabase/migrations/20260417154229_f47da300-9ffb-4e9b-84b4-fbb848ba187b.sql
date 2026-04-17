CREATE TABLE public.page_views (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id text NOT NULL,
  user_id uuid,
  path text NOT NULL,
  referrer text,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_page_views_created_at ON public.page_views (created_at DESC);
CREATE INDEX idx_page_views_visitor_id ON public.page_views (visitor_id);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert page views"
  ON public.page_views FOR INSERT
  TO anon, authenticated
  WITH CHECK (visitor_id IS NOT NULL AND visitor_id <> '');

CREATE POLICY "Admins can view page views"
  ON public.page_views FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete page views"
  ON public.page_views FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));