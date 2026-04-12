-- =============================================================================
-- CONSOLIDADO IDEMPOTENTE — Post-auditoría (Outbox, Ads anon, Leads, Fase 4)
-- =============================================================================
-- Cada bloque comprueba que la tabla exista (seguro en SQL Editor parcial).
-- Orden recomendado del repo: aplicar primero el resto de supabase/migrations.
-- Auditoría: docs/SUPABASE_MIGRATIONS_AUDIT.md
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1) club_memberships: CHECK alineado con TypeScript (pending | blocked)
--    + legacy inactive | invited
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'club_memberships'
  ) THEN
    ALTER TABLE public.club_memberships DROP CONSTRAINT IF EXISTS club_memberships_status_check;
    ALTER TABLE public.club_memberships
      ADD CONSTRAINT club_memberships_status_check
      CHECK (status IN ('active', 'inactive', 'invited', 'pending', 'blocked'));
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 2) club_staff_access_matrices: GRANT escritura
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'club_staff_access_matrices'
  ) THEN
    EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON public.club_staff_access_matrices TO authenticated';
    EXECUTE 'GRANT ALL ON public.club_staff_access_matrices TO service_role';
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 3) ad_events_queue
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'ad_events_queue'
  ) THEN
    EXECUTE 'ALTER TABLE public.ad_events_queue ENABLE ROW LEVEL SECURITY';

    DROP POLICY IF EXISTS "ad_events_queue_select_superadmin" ON public.ad_events_queue;
    CREATE POLICY "ad_events_queue_select_superadmin"
    ON public.ad_events_queue FOR SELECT TO authenticated
    USING (public.is_superadmin());

    DROP POLICY IF EXISTS "ad_events_queue_insert_anon" ON public.ad_events_queue;
    CREATE POLICY "ad_events_queue_insert_anon"
    ON public.ad_events_queue FOR INSERT TO anon
    WITH CHECK (true);

    EXECUTE 'GRANT SELECT ON public.ad_events_queue TO authenticated';
    EXECUTE 'GRANT INSERT ON public.ad_events_queue TO anon';
    EXECUTE 'GRANT ALL ON public.ad_events_queue TO service_role';
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 4) sandbox_terminal_leads (solo service_role; sin políticas anon/auth)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'sandbox_terminal_leads'
  ) THEN
    EXECUTE 'ALTER TABLE public.sandbox_terminal_leads ENABLE ROW LEVEL SECURITY';
    EXECUTE 'GRANT USAGE ON SCHEMA public TO service_role';
    EXECUTE 'GRANT ALL ON public.sandbox_terminal_leads TO service_role';
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 5) sandbox_device_snapshots (outbox; anon insert + service_role)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'sandbox_device_snapshots'
  ) THEN
    EXECUTE 'ALTER TABLE public.sandbox_device_snapshots ENABLE ROW LEVEL SECURITY';

    DROP POLICY IF EXISTS "sandbox_device_snapshots_insert_anon" ON public.sandbox_device_snapshots;
    CREATE POLICY "sandbox_device_snapshots_insert_anon"
    ON public.sandbox_device_snapshots FOR INSERT TO anon
    WITH CHECK (true);

    EXECUTE 'GRANT USAGE ON SCHEMA public TO service_role';
    EXECUTE 'GRANT INSERT ON public.sandbox_device_snapshots TO anon';
    EXECUTE 'GRANT SELECT, INSERT ON public.sandbox_device_snapshots TO service_role';
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 6) operativa_mobile_incidents (sin anon)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'operativa_mobile_incidents'
  ) THEN
    EXECUTE 'ALTER TABLE public.operativa_mobile_incidents ENABLE ROW LEVEL SECURITY';

    DROP POLICY IF EXISTS "operativa_mobile_incidents_club_scope" ON public.operativa_mobile_incidents;
    CREATE POLICY "operativa_mobile_incidents_club_scope"
    ON public.operativa_mobile_incidents FOR ALL TO authenticated
    USING (public.is_superadmin() OR club_id = public.auth_club_id())
    WITH CHECK (public.is_superadmin() OR club_id = public.auth_club_id());

    EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON public.operativa_mobile_incidents TO authenticated';
    EXECUTE 'GRANT ALL ON public.operativa_mobile_incidents TO service_role';
  END IF;
END $$;
