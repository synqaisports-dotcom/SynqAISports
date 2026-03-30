-- SynqAI: catálogo de roles (synq_roles), M2M opcional (profile_roles), RLS en tablas sensibles.
-- Ejecutar en staging antes de producción. El cliente service role sigue sin RLS.

-- ---------------------------------------------------------------------------
-- Funciones auxiliares (evitan recursión RLS al leer el propio perfil)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT (role::text = 'superadmin') FROM public.profiles WHERE id = auth.uid() LIMIT 1),
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.auth_club_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT club_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.auth_role_text()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT role::text FROM public.profiles WHERE id = auth.uid() LIMIT 1), '');
$$;

GRANT EXECUTE ON FUNCTION public.is_superadmin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.auth_club_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.auth_role_text() TO authenticated;

-- ---------------------------------------------------------------------------
-- synq_roles: definición de claves + etiquetas (sistema + custom)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.synq_roles (
  key text PRIMARY KEY CHECK (key ~ '^[a-z][a-z0-9_]*$'),
  label text NOT NULL,
  description text,
  is_system boolean NOT NULL DEFAULT false,
  permissions jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS synq_roles_is_system_idx ON public.synq_roles (is_system);

INSERT INTO public.synq_roles (key, label, description, is_system)
VALUES
  ('superadmin', 'Superadmin', 'Acceso total al admin-global y operaciones de red.', true),
  ('club_admin', 'Administrador del club', 'Gestión del club y configuración operativa.', true),
  ('coach', 'Entrenador', 'Pizarras, sesiones y herramientas de equipo.', true),
  ('promo_coach', 'Entrenador promo', 'Sandbox y flujo promocional limitado.', true),
  ('tutor', 'Tutor / familia', 'Portal familiar y comunicación.', true),
  ('athlete', 'Jugador / atleta', 'Perfil deportivo del jugador.', true)
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  is_system = EXCLUDED.is_system,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- profile_roles: roles adicionales por perfil (futuro multi-rol)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profile_roles (
  profile_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  role_key text NOT NULL REFERENCES public.synq_roles (key) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (profile_id, role_key)
);

CREATE INDEX IF NOT EXISTS profile_roles_role_key_idx ON public.profile_roles (role_key);

-- ---------------------------------------------------------------------------
-- RLS: synq_roles, profile_roles
-- ---------------------------------------------------------------------------
ALTER TABLE public.synq_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "synq_roles_select_authenticated" ON public.synq_roles;
CREATE POLICY "synq_roles_select_authenticated" ON public.synq_roles
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "synq_roles_write_superadmin" ON public.synq_roles;
CREATE POLICY "synq_roles_write_superadmin" ON public.synq_roles
  FOR ALL TO authenticated
  USING (public.is_superadmin())
  WITH CHECK (public.is_superadmin());

ALTER TABLE public.profile_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profile_roles_select_own_or_super" ON public.profile_roles;
CREATE POLICY "profile_roles_select_own_or_super" ON public.profile_roles
  FOR SELECT TO authenticated
  USING (profile_id = auth.uid() OR public.is_superadmin());

DROP POLICY IF EXISTS "profile_roles_write_superadmin" ON public.profile_roles;
CREATE POLICY "profile_roles_write_superadmin" ON public.profile_roles
  FOR ALL TO authenticated
  USING (public.is_superadmin())
  WITH CHECK (public.is_superadmin());

-- ---------------------------------------------------------------------------
-- RLS: profiles
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_select_superadmin" ON public.profiles;
CREATE POLICY "profiles_select_superadmin" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.is_superadmin());

DROP POLICY IF EXISTS "profiles_select_same_club_staff" ON public.profiles;
CREATE POLICY "profiles_select_same_club_staff" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    club_id IS NOT NULL
    AND club_id = public.auth_club_id()
    AND public.auth_role_text() IN ('club_admin', 'coach', 'promo_coach')
  );

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_superadmin" ON public.profiles;
CREATE POLICY "profiles_update_superadmin" ON public.profiles
  FOR UPDATE TO authenticated
  USING (public.is_superadmin())
  WITH CHECK (public.is_superadmin());

-- ---------------------------------------------------------------------------
-- RLS: clubs (insert: superadmin o id = club del perfil tras onboarding)
-- ---------------------------------------------------------------------------
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "clubs_select_member_or_super" ON public.clubs;
CREATE POLICY "clubs_select_member_or_super" ON public.clubs
  FOR SELECT TO authenticated
  USING (public.is_superadmin() OR id = public.auth_club_id());

DROP POLICY IF EXISTS "clubs_insert_super_or_linked" ON public.clubs;
CREATE POLICY "clubs_insert_super_or_linked" ON public.clubs
  FOR INSERT TO authenticated
  WITH CHECK (public.is_superadmin() OR id = public.auth_club_id());

DROP POLICY IF EXISTS "clubs_update_admin" ON public.clubs;
CREATE POLICY "clubs_update_admin" ON public.clubs
  FOR UPDATE TO authenticated
  USING (
    public.is_superadmin()
    OR (id = public.auth_club_id() AND public.auth_role_text() = 'club_admin')
  )
  WITH CHECK (
    public.is_superadmin()
    OR (id = public.auth_club_id() AND public.auth_role_text() = 'club_admin')
  );

-- ---------------------------------------------------------------------------
-- RLS: exercises, athletes, matches (ámbito club)
-- ---------------------------------------------------------------------------
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "exercises_club_scope" ON public.exercises;
CREATE POLICY "exercises_club_scope" ON public.exercises
  FOR ALL TO authenticated
  USING (public.is_superadmin() OR club_id = public.auth_club_id())
  WITH CHECK (public.is_superadmin() OR club_id = public.auth_club_id());

ALTER TABLE public.athletes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "athletes_club_scope" ON public.athletes;
CREATE POLICY "athletes_club_scope" ON public.athletes
  FOR ALL TO authenticated
  USING (public.is_superadmin() OR club_id = public.auth_club_id())
  WITH CHECK (public.is_superadmin() OR club_id = public.auth_club_id());

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "matches_club_scope" ON public.matches;
CREATE POLICY "matches_club_scope" ON public.matches
  FOR ALL TO authenticated
  USING (public.is_superadmin() OR club_id = public.auth_club_id())
  WITH CHECK (public.is_superadmin() OR club_id = public.auth_club_id());

-- Permisos de tabla (Supabase: authenticated + service_role)
GRANT SELECT ON TABLE public.synq_roles TO authenticated;
GRANT ALL ON TABLE public.synq_roles TO service_role;

GRANT ALL ON TABLE public.profile_roles TO authenticated;
GRANT ALL ON TABLE public.profile_roles TO service_role;
