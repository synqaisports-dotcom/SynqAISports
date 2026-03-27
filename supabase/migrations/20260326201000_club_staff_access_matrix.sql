-- Metodología/Acceso: matriz de permisos a nivel club (configuración UI)
-- Persistimos la matriz para que el club admin decida qué roles pueden ver/crear.

CREATE TABLE IF NOT EXISTS public.club_staff_access_matrices (
  club_id uuid PRIMARY KEY REFERENCES public.clubs (id) ON DELETE CASCADE,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.touch_club_staff_access_matrices_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_club_staff_access_matrices_updated_at ON public.club_staff_access_matrices;
CREATE TRIGGER trg_club_staff_access_matrices_updated_at
  BEFORE UPDATE ON public.club_staff_access_matrices
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_club_staff_access_matrices_updated_at();

ALTER TABLE public.club_staff_access_matrices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "club_staff_access_matrices_select_admin" ON public.club_staff_access_matrices;
CREATE POLICY "club_staff_access_matrices_select_admin" ON public.club_staff_access_matrices
  FOR SELECT TO authenticated
  USING (
    public.is_superadmin()
    OR (
      club_id = public.auth_club_id()
      AND public.auth_role_text() IN ('club_admin')
    )
  );

DROP POLICY IF EXISTS "club_staff_access_matrices_write_admin" ON public.club_staff_access_matrices;
CREATE POLICY "club_staff_access_matrices_write_admin" ON public.club_staff_access_matrices
  FOR ALL TO authenticated
  USING (
    public.is_superadmin()
    OR (
      club_id = public.auth_club_id()
      AND public.auth_role_text() IN ('club_admin')
    )
  )
  WITH CHECK (
    public.is_superadmin()
    OR (
      club_id = public.auth_club_id()
      AND public.auth_role_text() IN ('club_admin')
    )
  );

GRANT ALL ON public.club_staff_access_matrices TO service_role;
GRANT SELECT ON public.club_staff_access_matrices TO authenticated;

