-- Ajuste RLS: permitir SELECT a roles de staff del club,
-- mantener escritura solo para club_admin (y superadmin).

DROP POLICY IF EXISTS "club_staff_access_matrices_select_admin" ON public.club_staff_access_matrices;
CREATE POLICY "club_staff_access_matrices_select_staff" ON public.club_staff_access_matrices
  FOR SELECT TO authenticated
  USING (
    public.is_superadmin()
    OR (
      club_id = public.auth_club_id()
      AND public.auth_role_text() IN (
        'club_admin',
        'coach',
        'promo_coach',
        'academy_director',
        'methodology_director',
        'stage_coordinator',
        'delegate',
        'tutor',
        'athlete'
      )
    )
  );

-- Escritura (PUT) ya estaba restringida a club_admin en el migrate anterior.

