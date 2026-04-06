INSERT INTO public.user_roles (user_id, role)
VALUES ('81d74a0a-1409-48cd-9ee2-1d9917407957', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;