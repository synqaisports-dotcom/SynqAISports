-- Admin Global: auditoría centralizada.

CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  actor_email text,
  title text NOT NULL,
  description text NOT NULL,
  type text NOT NULL DEFAULT 'Info' CHECK (type IN ('Success', 'Info', 'Warning')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_audit_logs_created_idx ON public.admin_audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS admin_audit_logs_type_idx ON public.admin_audit_logs (type, created_at DESC);

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_audit_logs_read_superadmin" ON public.admin_audit_logs;
CREATE POLICY "admin_audit_logs_read_superadmin" ON public.admin_audit_logs
  FOR SELECT TO authenticated
  USING (public.is_superadmin());

DROP POLICY IF EXISTS "admin_audit_logs_write_superadmin" ON public.admin_audit_logs;
CREATE POLICY "admin_audit_logs_write_superadmin" ON public.admin_audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (public.is_superadmin());

GRANT SELECT, INSERT ON public.admin_audit_logs TO authenticated;
GRANT ALL ON public.admin_audit_logs TO service_role;
