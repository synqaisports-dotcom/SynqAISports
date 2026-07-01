-- Plantillas vs instancias por equipo

alter table public.synq_microcycles
  add column if not exists template_microcycle_id uuid references public.synq_microcycles (id) on delete set null,
  add column if not exists is_template boolean not null default false;

create index if not exists synq_microcycles_team_plan_idx
  on public.synq_microcycles (club_id, team_id, plan_variant_id, plan_mcc_id);

alter table public.synq_change_requests
  add column if not exists team_id uuid references public.synq_teams (id) on delete set null,
  add column if not exists session_label text,
  add column if not exists microcycle_id uuid references public.synq_microcycles (id) on delete set null;
