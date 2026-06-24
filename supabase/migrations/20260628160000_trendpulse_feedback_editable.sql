-- Feedback editable: un registro activo por slot (upsert vía API)

CREATE UNIQUE INDEX IF NOT EXISTS idx_cycle_feedback_slot_unique
  ON public.trend_cycle_feedback (slot_id);

DROP POLICY IF EXISTS trend_cycle_feedback_update ON public.trend_cycle_feedback;
CREATE POLICY trend_cycle_feedback_update ON public.trend_cycle_feedback
  FOR UPDATE USING (true);

GRANT UPDATE ON public.trend_cycle_feedback TO service_role;
