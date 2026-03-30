-- Operativa Elite: núcleo relacional para planificación de sesiones.
-- Fase híbrida: se crea backend sin romper fallback localStorage.

-- =========================
-- 1) Asignaciones por sesión
-- =========================
CREATE TABLE IF NOT EXISTS public.methodology_session_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES public.clubs (id) ON DELETE CASCADE,
  team_id text NOT NULL,
  mcc text NOT NULL,
  session text NOT NULL,
  block_key text NOT NULL CHECK (block_key IN ('warmup', 'central', 'cooldown')),
  exercise_key text,
  exercise_title text NOT NULL,
  source text NOT NULL DEFAULT 'planner' CHECK (source IN ('planner', 'coach_approved', 'system')),
  updated_by uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (club_id, team_id, mcc, session, block_key)
);

CREATE INDEX IF NOT EXISTS methodology_session_assignments_scope_idx
  ON public.methodology_session_assignments (club_id, team_id, mcc, session);

-- =========================
-- 2) Solicitudes de cambio
-- =========================
CREATE TABLE IF NOT EXISTS public.methodology_change_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES public.clubs (id) ON DELETE CASCADE,
  team_id text NOT NULL,
  mcc text NOT NULL,
  session text NOT NULL,
  block_key text NOT NULL CHECK (block_key IN ('warmup', 'central', 'cooldown')),
  original_exercise_key text,
  original_exercise text NOT NULL,
  proposed_exercise_key text,
  proposed_exercise text NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Denied')),
  coach_id uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  coach_name text,
  director_id uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  director_comment text,
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS methodology_change_requests_scope_idx
  ON public.methodology_change_requests (club_id, team_id, mcc, session);
CREATE INDEX IF NOT EXISTS methodology_change_requests_status_idx
  ON public.methodology_change_requests (club_id, status, created_at DESC);

-- =========================
-- 3) Asistencia por jugador
-- =========================
CREATE TABLE IF NOT EXISTS public.methodology_session_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES public.clubs (id) ON DELETE CASCADE,
  team_id text NOT NULL,
  mcc text NOT NULL,
  session text NOT NULL,
  player_id text NOT NULL,
  status text NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  updated_by uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (club_id, team_id, mcc, session, player_id)
);

CREATE INDEX IF NOT EXISTS methodology_session_attendance_scope_idx
  ON public.methodology_session_attendance (club_id, team_id, mcc, session);

-- =========================
-- 4) Triggers updated_at
-- =========================
CREATE OR REPLACE FUNCTION public.touch_operativa_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_methodology_session_assignments_updated_at ON public.methodology_session_assignments;
CREATE TRIGGER trg_methodology_session_assignments_updated_at
  BEFORE UPDATE ON public.methodology_session_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_operativa_updated_at();

-- =========================
-- 5) RLS
-- =========================
ALTER TABLE public.methodology_session_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.methodology_change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.methodology_session_attendance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "methodology_session_assignments_club_scope" ON public.methodology_session_assignments;
CREATE POLICY "methodology_session_assignments_club_scope" ON public.methodology_session_assignments
  FOR ALL TO authenticated
  USING (public.is_superadmin() OR club_id = public.auth_club_id())
  WITH CHECK (public.is_superadmin() OR club_id = public.auth_club_id());

DROP POLICY IF EXISTS "methodology_change_requests_club_scope" ON public.methodology_change_requests;
CREATE POLICY "methodology_change_requests_club_scope" ON public.methodology_change_requests
  FOR ALL TO authenticated
  USING (public.is_superadmin() OR club_id = public.auth_club_id())
  WITH CHECK (public.is_superadmin() OR club_id = public.auth_club_id());

DROP POLICY IF EXISTS "methodology_session_attendance_club_scope" ON public.methodology_session_attendance;
CREATE POLICY "methodology_session_attendance_club_scope" ON public.methodology_session_attendance
  FOR ALL TO authenticated
  USING (public.is_superadmin() OR club_id = public.auth_club_id())
  WITH CHECK (public.is_superadmin() OR club_id = public.auth_club_id());

GRANT ALL ON public.methodology_session_assignments TO service_role;
GRANT ALL ON public.methodology_change_requests TO service_role;
GRANT ALL ON public.methodology_session_attendance TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.methodology_session_assignments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.methodology_change_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.methodology_session_attendance TO authenticated;
