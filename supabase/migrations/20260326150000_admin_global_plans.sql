-- Admin Global: planes comerciales/configuración operativa.

CREATE TABLE IF NOT EXISTS public.global_plans (
  id text PRIMARY KEY,
  title text NOT NULL,
  price_per_node text,
  min_nodes text,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  access jsonb NOT NULL DEFAULT '[]'::jsonb,
  default_role text NOT NULL DEFAULT 'club_admin',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS global_plans_active_idx ON public.global_plans (is_active);
CREATE INDEX IF NOT EXISTS global_plans_updated_idx ON public.global_plans (updated_at DESC);

CREATE OR REPLACE FUNCTION public.touch_global_plans_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_global_plans_updated_at ON public.global_plans;
CREATE TRIGGER trg_global_plans_updated_at
  BEFORE UPDATE ON public.global_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_global_plans_updated_at();

ALTER TABLE public.global_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "global_plans_read_authenticated" ON public.global_plans;
CREATE POLICY "global_plans_read_authenticated" ON public.global_plans
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "global_plans_write_superadmin" ON public.global_plans;
CREATE POLICY "global_plans_write_superadmin" ON public.global_plans
  FOR ALL TO authenticated
  USING (public.is_superadmin())
  WITH CHECK (public.is_superadmin());

GRANT SELECT ON public.global_plans TO authenticated;
GRANT ALL ON public.global_plans TO service_role;
