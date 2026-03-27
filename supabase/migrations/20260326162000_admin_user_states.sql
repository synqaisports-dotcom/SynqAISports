-- Estado administrativo de usuarios para admin-global/users.

CREATE TABLE IF NOT EXISTS public.admin_user_states (
  profile_id uuid PRIMARY KEY REFERENCES public.profiles (id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'Approved' CHECK (status IN ('Pending', 'Approved', 'Denied')),
  last_seen text NOT NULL DEFAULT 'Online',
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_user_states_status_idx ON public.admin_user_states (status, updated_at DESC);

CREATE OR REPLACE FUNCTION public.touch_admin_user_states_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_admin_user_states_updated_at ON public.admin_user_states;
CREATE TRIGGER trg_admin_user_states_updated_at
  BEFORE UPDATE ON public.admin_user_states
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_admin_user_states_updated_at();

ALTER TABLE public.admin_user_states ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_user_states_read_superadmin" ON public.admin_user_states;
CREATE POLICY "admin_user_states_read_superadmin" ON public.admin_user_states
  FOR SELECT TO authenticated
  USING (public.is_superadmin());

DROP POLICY IF EXISTS "admin_user_states_write_superadmin" ON public.admin_user_states;
CREATE POLICY "admin_user_states_write_superadmin" ON public.admin_user_states
  FOR ALL TO authenticated
  USING (public.is_superadmin())
  WITH CHECK (public.is_superadmin());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_user_states TO authenticated;
GRANT ALL ON public.admin_user_states TO service_role;
