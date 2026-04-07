
-- Chat rooms table for live chat sessions
CREATE TABLE public.chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_name TEXT NOT NULL,
  visitor_email TEXT,
  session_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active',
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  unread_admin INT NOT NULL DEFAULT 0,
  unread_visitor INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Chat messages table
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('visitor', 'admin')),
  sender_name TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Allow anyone to create/read chat rooms (public chat)
CREATE POLICY "Anyone can create chat rooms" ON public.chat_rooms FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can read chat rooms" ON public.chat_rooms FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can update chat rooms" ON public.chat_rooms FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- Allow anyone to create/read messages
CREATE POLICY "Anyone can create messages" ON public.chat_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can read messages" ON public.chat_messages FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can update messages" ON public.chat_messages FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Hero slider images table
CREATE TABLE public.hero_sliders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  link_url TEXT DEFAULT '/shop',
  sort_order INT DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hero_sliders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read hero sliders" ON public.hero_sliders FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage hero sliders" ON public.hero_sliders FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
