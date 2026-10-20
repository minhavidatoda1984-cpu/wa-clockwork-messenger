CREATE TABLE public.chips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  numero text NOT NULL DEFAULT '',
  evolution_url text NOT NULL DEFAULT 'https://evolution.naturaisterravida.com.br',
  instancia text NOT NULL DEFAULT '',
  api_key text,
  status text NOT NULL DEFAULT 'desconectado' CHECK (status IN ('conectado','desconectado')),
  status_atualizado_em timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chips TO authenticated;
GRANT ALL ON public.chips TO service_role;
ALTER TABLE public.chips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all chips" ON public.chips FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.destinos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo text NOT NULL DEFAULT 'contato' CHECK (tipo IN ('contato','grupo')),
  nome text NOT NULL,
  identificador text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.destinos TO authenticated;
GRANT ALL ON public.destinos TO service_role;
ALTER TABLE public.destinos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all destinos" ON public.destinos FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.agendamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL DEFAULT '',
  usar_texto boolean NOT NULL DEFAULT false,
  texto text,
  usar_chip boolean NOT NULL DEFAULT false,
  chip_id uuid REFERENCES public.chips(id) ON DELETE SET NULL,
  usar_destino boolean NOT NULL DEFAULT false,
  destino_id uuid REFERENCES public.destinos(id) ON DELETE SET NULL,
  usar_horario boolean NOT NULL DEFAULT false,
  horario time,
  data_inicio date NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo')::date,
  usar_repeticao boolean NOT NULL DEFAULT false,
  repeticao text NOT NULL DEFAULT 'unico' CHECK (repeticao IN ('unico','diario','intervalo')),
  intervalo_dias integer CHECK (intervalo_dias IS NULL OR intervalo_dias >= 1),
  ativo boolean NOT NULL DEFAULT true,
  ultimo_envio timestamptz,
  proximo_envio timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agendamentos TO authenticated;
GRANT ALL ON public.agendamentos TO service_role;
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all agendamentos" ON public.agendamentos FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.envios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agendamento_id uuid REFERENCES public.agendamentos(id) ON DELETE CASCADE,
  enviado_em timestamptz NOT NULL DEFAULT now(),
  sucesso boolean NOT NULL DEFAULT true,
  resposta text
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.envios TO authenticated;
GRANT ALL ON public.envios TO service_role;
ALTER TABLE public.envios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all envios" ON public.envios FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.calcular_proximo_envio()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  base_local timestamp;
  ult_local timestamp;
  passo integer;
  k integer;
BEGIN
  NEW.updated_at := now();
  base_local := NEW.data_inicio + COALESCE(CASE WHEN NEW.usar_horario THEN NEW.horario END, time '00:00');
  IF NEW.ultimo_envio IS NULL THEN
    NEW.proximo_envio := base_local AT TIME ZONE 'America/Sao_Paulo';
    RETURN NEW;
  END IF;
  IF NOT NEW.usar_repeticao OR NEW.repeticao = 'unico' THEN
    NEW.proximo_envio := NULL;
    RETURN NEW;
  END IF;
  passo := CASE WHEN NEW.repeticao = 'diario' THEN 1 ELSE COALESCE(NEW.intervalo_dias, 1) END;
  ult_local := NEW.ultimo_envio AT TIME ZONE 'America/Sao_Paulo';
  IF ult_local < base_local THEN
    k := 0;
  ELSE
    k := floor(extract(epoch FROM (ult_local - base_local)) / 86400.0 / passo)::int + 1;
  END IF;
  NEW.proximo_envio := (base_local + make_interval(days => k * passo)) AT TIME ZONE 'America/Sao_Paulo';
  RETURN NEW;
END $$;

CREATE TRIGGER trg_agendamentos_proximo
BEFORE INSERT OR UPDATE ON public.agendamentos
FOR EACH ROW EXECUTE FUNCTION public.calcular_proximo_envio();