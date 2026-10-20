CREATE TABLE public.configuracoes (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  n8n_token text NOT NULL DEFAULT encode(extensions.gen_random_bytes(24), 'hex'),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.configuracoes TO authenticated;
GRANT ALL ON public.configuracoes TO service_role;
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read config" ON public.configuracoes FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth update config" ON public.configuracoes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
INSERT INTO public.configuracoes (id) VALUES (1);