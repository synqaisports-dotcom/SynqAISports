-- Opción 1 (profesional): membresías por club + compatibilidad con profiles.club_id.
-- Objetivo:
-- 1) Introducir `club_memberships` como fuente de pertenencia por club.
-- 2) Backfill desde `profiles.club_id` para no perder datos existentes.
-- 3) Mantener `profiles.club_id` como default/compatibilidad durante transición.

CREATE TABLE IF NOT EXISTS public.club_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  club_id uuid NOT NULL REFERENCES public.clubs (id) ON DELETE CASCADE,
  role_in_club text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'invited')),
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, club_id)
);

CREATE INDEX IF NOT EXISTS club_memberships_user_idx
  ON public.club_memberships (user_id, status, is_default);

CREATE INDEX IF NOT EXISTS club_memberships_club_idx
  ON public.club_memberships (club_id, status);

CREATE OR REPLACE FUNCTION public.touch_club_memberships_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_club_memberships_updated_at ON public.club_memberships;
CREATE TRIGGER trg_club_memberships_updated_at
  BEFORE UPDATE ON public.club_memberships
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_club_memberships_updated_at();

-- Backfill: crea membresías activas para perfiles con club_id.
INSERT INTO public.club_memberships (user_id, club_id, role_in_club, status, is_default)
SELECT
  p.id,
  p.club_id,
  COALESCE(NULLIF(p.role::text, ''), 'coach') AS role_in_club,
  'active',
  true
FROM public.profiles p
WHERE p.club_id IS NOT NULL
ON CONFLICT (user_id, club_id) DO UPDATE SET
  role_in_club = EXCLUDED.role_in_club,
  status = 'active',
  is_default = true,
  updated_at = now();

ALTER TABLE public.club_memberships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "club_memberships_select_own_or_super" ON public.club_memberships;
CREATE POLICY "club_memberships_select_own_or_super" ON public.club_memberships
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_superadmin());

DROP POLICY IF EXISTS "club_memberships_write_superadmin" ON public.club_memberships;
CREATE POLICY "club_memberships_write_superadmin" ON public.club_memberships
  FOR ALL TO authenticated
  USING (public.is_superadmin())
  WITH CHECK (public.is_superadmin());

GRANT SELECT ON public.club_memberships TO authenticated;
GRANT ALL ON public.club_memberships TO service_role;
