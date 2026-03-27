-- Metodología: persistencia híbrida del Almacén (Warehouse) como JSONB
-- Enfoque: guardar el estado completo que maneja `dashboard/methodology/warehouse` (state + teams).

CREATE TABLE IF NOT EXISTS public.methodology_warehouse_state (
  club_id uuid PRIMARY KEY REFERENCES public.clubs (id) ON DELETE CASCADE,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.touch_methodology_warehouse_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_methodology_warehouse_state_updated_at ON public.methodology_warehouse_state;
CREATE TRIGGER trg_methodology_warehouse_state_updated_at
  BEFORE UPDATE ON public.methodology_warehouse_state
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_methodology_warehouse_updated_at();

ALTER TABLE public.methodology_warehouse_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "methodology_warehouse_state_club_scope" ON public.methodology_warehouse_state;
CREATE POLICY "methodology_warehouse_state_club_scope" ON public.methodology_warehouse_state
  FOR ALL TO authenticated
  USING (public.is_superadmin() OR club_id = public.auth_club_id())
  WITH CHECK (public.is_superadmin() OR club_id = public.auth_club_id());

GRANT ALL ON public.methodology_warehouse_state TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.methodology_warehouse_state TO authenticated;

