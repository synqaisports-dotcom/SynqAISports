-- Promo: campañas, eventos de escaneo, RPC pública de tracking, RLS solo superadmin en tablas.
-- Si el trigger falla en tu Postgres: sustituye EXECUTE FUNCTION por EXECUTE PROCEDURE en los CREATE TRIGGER.

-- ---------------------------------------------------------------------------
-- Tablas
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS public.promo_campaign_events CASCADE;
DROP TABLE IF EXISTS public.promo_campaigns CASCADE;

CREATE TABLE public.promo_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  token text NOT NULL UNIQUE,
  plan_id text,
  country_code text NOT NULL DEFAULT 'ALL',
  channel text,
  periodicity text,
  max_uses integer,
  scan_count integer NOT NULL DEFAULT 0 CHECK (scan_count >= 0),
  expires_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  hook text,
  main_copy text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX promo_campaigns_token_idx ON public.promo_campaigns (token);
CREATE INDEX promo_campaigns_active_idx ON public.promo_campaigns (is_active);

CREATE TABLE public.promo_campaign_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.promo_campaigns (id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'scan',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX promo_campaign_events_campaign_idx ON public.promo_campaign_events (campaign_id);

-- ---------------------------------------------------------------------------
-- updated_at
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_promo_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_promo_campaigns_updated_at ON public.promo_campaigns;
CREATE TRIGGER trg_promo_campaigns_updated_at
  BEFORE UPDATE ON public.promo_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.set_promo_updated_at();

-- ---------------------------------------------------------------------------
-- RPC: incrementar scan (anon / público vía API)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.record_promo_scan(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  c public.promo_campaigns%ROWTYPE;
BEGIN
  IF p_token IS NULL OR length(trim(p_token)) = 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'empty_token');
  END IF;

  SELECT * INTO c
  FROM public.promo_campaigns
  WHERE token = trim(p_token) AND is_active = true
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_found');
  END IF;

  IF c.expires_at IS NOT NULL AND c.expires_at < now() THEN
    RETURN jsonb_build_object('ok', false, 'error', 'expired');
  END IF;

  IF c.max_uses IS NOT NULL AND c.scan_count >= c.max_uses THEN
    RETURN jsonb_build_object('ok', false, 'error', 'max_uses');
  END IF;

  UPDATE public.promo_campaigns
  SET scan_count = scan_count + 1, updated_at = now()
  WHERE id = c.id;

  INSERT INTO public.promo_campaign_events (campaign_id, kind)
  VALUES (c.id, 'scan');

  RETURN jsonb_build_object(
    'ok', true,
    'scan_count', c.scan_count + 1,
    'campaign_id', c.id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_promo_scan(text) TO anon;
GRANT EXECUTE ON FUNCTION public.record_promo_scan(text) TO authenticated;

-- ---------------------------------------------------------------------------
-- RLS: tablas solo superadmin; RPC bypassa tablas con SECURITY DEFINER
-- ---------------------------------------------------------------------------
ALTER TABLE public.promo_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_campaign_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS promo_campaigns_superadmin_all ON public.promo_campaigns;
CREATE POLICY promo_campaigns_superadmin_all ON public.promo_campaigns
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role::text = 'superadmin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role::text = 'superadmin'
    )
  );

DROP POLICY IF EXISTS promo_campaign_events_superadmin_all ON public.promo_campaign_events;
CREATE POLICY promo_campaign_events_superadmin_all ON public.promo_campaign_events
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role::text = 'superadmin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role::text = 'superadmin'
    )
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.promo_campaigns TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.promo_campaign_events TO authenticated;
GRANT ALL ON TABLE public.promo_campaigns TO service_role;
GRANT ALL ON TABLE public.promo_campaign_events TO service_role;
