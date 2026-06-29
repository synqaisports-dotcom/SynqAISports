alter table public.synq_teams
  add column if not exists category_slug text check (
    category_slug is null
    or category_slug in (
      'debutantes',
      'prebenjamin',
      'benjamin',
      'alevin',
      'infantil',
      'cadete',
      'juvenil'
    )
  );

create index if not exists synq_teams_category_slug_idx
  on public.synq_teams (club_id, category_slug)
  where category_slug is not null;
