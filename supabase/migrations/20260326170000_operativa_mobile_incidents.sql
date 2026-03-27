-- Incidencias rápidas capturadas desde modo continuidad móvil.

CREATE TABLE IF NOT EXISTS public.operativa_mobile_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES public.clubs (id) ON DELETE CASCADE,
  actor_id uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  team_id text NOT NULL,
  mcc text NOT NULL,
  session text NOT NULL,
  incident_id text NOT NULL,
  incident_label text NOT NULL,
  score_home integer NOT NULL DEFAULT 0,
  score_guest integer NOT NULL DEFAULT 0,
  remaining_sec integer NOT NULL DEFAULT 0,
  source text NOT NULL DEFAULT 'mobile_continuity',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS operativa_mobile_incidents_scope_idx
  ON public.operativa_mobile_incidents (club_id, team_id, mcc, session, created_at DESC);

ALTER TABLE public.operativa_mobile_incidents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "operativa_mobile_incidents_club_scope" ON public.operativa_mobile_incidents;
CREATE POLICY "operativa_mobile_incidents_club_scope" ON public.operativa_mobile_incidents
  FOR ALL TO authenticated
  USING (public.is_superadmin() OR club_id = public.auth_club_id())
  WITH CHECK (public.is_superadmin() OR club_id = public.auth_club_id());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.operativa_mobile_incidents TO authenticated;
GRANT ALL ON public.operativa_mobile_incidents TO service_role;
