-- Metodología: persistencia híbrida de Academy/Cantera (categorías/equipos/days)
-- Enfoque: guardar el árbol como JSONB para mantener la lógica UI.

CREATE TABLE IF NOT EXISTS public.methodology_academy_state (
  club_id uuid PRIMARY KEY REFERENCES public.clubs (id) ON DELETE CASCADE,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.touch_methodology_academy_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_methodology_academy_state_updated_at ON public.methodology_academy_state;
CREATE TRIGGER trg_methodology_academy_state_updated_at
  BEFORE UPDATE ON public.methodology_academy_state
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_methodology_academy_updated_at();

ALTER TABLE public.methodology_academy_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "methodology_academy_state_club_scope" ON public.methodology_academy_state;
CREATE POLICY "methodology_academy_state_club_scope" ON public.methodology_academy_state
  FOR ALL TO authenticated
  USING (public.is_superadmin() OR club_id = public.auth_club_id())
  WITH CHECK (public.is_superadmin() OR club_id = public.auth_club_id());

GRANT ALL ON public.methodology_academy_state TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.methodology_academy_state TO authenticated;

