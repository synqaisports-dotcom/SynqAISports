-- Enlaces planograma ↔ microciclos (variantes de ritmo por categoría)

alter table public.synq_microcycles
  add column if not exists category_slug text,
  add column if not exists plan_mcc_id text,
  add column if not exists plan_variant_id text,
  add column if not exists week_end date;

create index if not exists synq_microcycles_plan_mcc_idx
  on public.synq_microcycles (club_id, category_slug, plan_variant_id, plan_mcc_id);
