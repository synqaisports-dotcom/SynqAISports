-- TrendPulse Fase 2d: Ciclo patio (3 ACTUAR + 2-3 OBSERVAR + feedback)

CREATE TABLE IF NOT EXISTS public.trend_cycles (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          text UNIQUE NOT NULL,
  title         text NOT NULL,
  starts_at     date NOT NULL,
  ends_at       date,
  status        text NOT NULL DEFAULT 'active'
    CHECK (status IN ('draft', 'active', 'closed')),
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.trend_cycle_slots (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id              uuid NOT NULL REFERENCES public.trend_cycles(id) ON DELETE CASCADE,
  mode                  text NOT NULL CHECK (mode IN ('act', 'observe')),
  sort_order            int NOT NULL DEFAULT 0,
  canonical_name        text NOT NULL,
  slug                  text,
  image_url             text,
  world                 text NOT NULL DEFAULT 'playground'
    CHECK (world IN ('playground', 'collector', 'adult')),
  origin_price_eur      numeric(10,2),
  origin_marketplace    text,
  purchase_url          text,
  units_sold_label      text,
  signal_cn             int NOT NULL DEFAULT 0,
  signal_us             int NOT NULL DEFAULT 0,
  signal_es             int NOT NULL DEFAULT 0,
  dna_match_slug        text,
  estimated_window_es   text,
  source_type           text NOT NULL DEFAULT 'manual',
  notes                 text,
  created_at            timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.trend_cycle_feedback (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id         uuid NOT NULL REFERENCES public.trend_cycle_slots(id) ON DELETE CASCADE,
  feedback_type   text NOT NULL
    CHECK (feedback_type IN ('playground_viral', 'arrived_es', 'no_show', 'false_positive')),
  rating          int CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  notes           text,
  recorded_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trend_cycle_slots_cycle ON public.trend_cycle_slots(cycle_id);
CREATE INDEX IF NOT EXISTS idx_trend_cycle_feedback_slot ON public.trend_cycle_feedback(slot_id);

ALTER TABLE public.trend_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trend_cycle_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trend_cycle_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS trend_cycles_read ON public.trend_cycles;
CREATE POLICY trend_cycles_read ON public.trend_cycles FOR SELECT USING (true);

DROP POLICY IF EXISTS trend_cycle_slots_read ON public.trend_cycle_slots;
CREATE POLICY trend_cycle_slots_read ON public.trend_cycle_slots FOR SELECT USING (true);

DROP POLICY IF EXISTS trend_cycle_feedback_read ON public.trend_cycle_feedback;
CREATE POLICY trend_cycle_feedback_read ON public.trend_cycle_feedback FOR SELECT USING (true);

DROP POLICY IF EXISTS trend_cycle_feedback_insert ON public.trend_cycle_feedback;
CREATE POLICY trend_cycle_feedback_insert ON public.trend_cycle_feedback FOR INSERT WITH CHECK (true);

GRANT SELECT ON public.trend_cycles TO anon, authenticated;
GRANT SELECT ON public.trend_cycle_slots TO anon, authenticated;
GRANT SELECT, INSERT ON public.trend_cycle_feedback TO anon, authenticated;
GRANT ALL ON public.trend_cycles TO service_role;
GRANT ALL ON public.trend_cycle_slots TO service_role;
GRANT ALL ON public.trend_cycle_feedback TO service_role;

COMMENT ON TABLE public.trend_cycles IS 'Ciclo quincenal patio: 3 actuar + 2-3 observar';
COMMENT ON TABLE public.trend_cycle_slots IS 'Producto candidato en un ciclo';
COMMENT ON TABLE public.trend_cycle_feedback IS 'Feedback patio / llegada ES para aprendizaje ADN+IA';
