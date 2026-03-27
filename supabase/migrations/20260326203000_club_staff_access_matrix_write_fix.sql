-- Ajuste: permitir escritura al rol que gestiona cantera/config (club_admin + academy_director)

DROP POLICY IF EXISTS "club_staff_access_matrices_write_admin" ON public.club_staff_access_matrices;
CREATE POLICY "club_staff_access_matrices_write_club_roles" ON public.club_staff_access_matrices
  FOR ALL TO authenticated
  USING (
    public.is_superadmin()
    OR (
      club_id = public.auth_club_id()
      AND public.auth_role_text() IN ('club_admin', 'academy_director')
    )
  )
  WITH CHECK (
    public.is_superadmin()
    OR (
      club_id = public.auth_club_id()
      AND public.auth_role_text() IN ('club_admin', 'academy_director')
    )
  );

