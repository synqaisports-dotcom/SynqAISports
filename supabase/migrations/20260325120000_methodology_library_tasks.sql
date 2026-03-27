-- Metodología: tareas maestras (biblioteca de ejercicios + pizarra).
-- Coordenadas: elements en JSON fracción 0–1 del canvas táctico; board_coord_space = canvas_normalized_v1.
-- RLS: mismo ámbito que exercises (club + superadmin).

CREATE TABLE IF NOT EXISTS public.methodology_library_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES public.clubs (id) ON DELETE CASCADE,
  author_id uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Official')),
  stage text NOT NULL,
  dimension text NOT NULL DEFAULT 'Táctica',
  title text NOT NULL,
  author_name text,
  didactic_strategy text,
  objectives text,
  conditional_content text,
  time text,
  space text,
  game_situation text,
  technical_action text,
  tactical_action text,
  collective_content text,
  description text,
  provocation_rules text,
  instructions text,
  -- JSON string MaterialRequirement[] (convención biblioteca UI)
  equipment text,
  photo_url text,
  elements jsonb NOT NULL DEFAULT '[]'::jsonb,
  board jsonb NOT NULL DEFAULT '{}'::jsonb,
  board_coord_space text NOT NULL DEFAULT 'canvas_normalized_v1',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS methodology_library_tasks_club_status_idx
  ON public.methodology_library_tasks (club_id, status);
CREATE INDEX IF NOT EXISTS methodology_library_tasks_club_updated_idx
  ON public.methodology_library_tasks (club_id, updated_at DESC);

-- updated_at
CREATE OR REPLACE FUNCTION public.touch_methodology_library_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_methodology_library_tasks_updated_at ON public.methodology_library_tasks;
CREATE TRIGGER trg_methodology_library_tasks_updated_at
  BEFORE UPDATE ON public.methodology_library_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_methodology_library_updated_at();

ALTER TABLE public.methodology_library_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "methodology_library_tasks_club_scope" ON public.methodology_library_tasks;
CREATE POLICY "methodology_library_tasks_club_scope" ON public.methodology_library_tasks
  FOR ALL TO authenticated
  USING (public.is_superadmin() OR club_id = public.auth_club_id())
  WITH CHECK (public.is_superadmin() OR club_id = public.auth_club_id());

GRANT ALL ON public.methodology_library_tasks TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.methodology_library_tasks TO authenticated;

COMMENT ON TABLE public.methodology_library_tasks IS 'Biblioteca operativa elite: tarea maestra, JSON elements 0-1 en canvas del campo.';

-- Si el trigger falla: usar EXECUTE PROCEDURE en lugar de EXECUTE FUNCTION (según versión Postgres).
