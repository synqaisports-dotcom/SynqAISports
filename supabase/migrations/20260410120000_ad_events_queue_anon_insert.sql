-- Permite ingestión de eventos de ads/usage desde el cliente vía API con anon key
-- (cuando no hay service role en preview / edge). Idempotente.

drop policy if exists "ad_events_queue_insert_anon" on public.ad_events_queue;
create policy "ad_events_queue_insert_anon"
on public.ad_events_queue
for insert
to anon
with check (true);

grant insert on public.ad_events_queue to anon;
