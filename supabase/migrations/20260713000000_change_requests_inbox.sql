-- Solicitudes: tipos, resolución y bandeja de notificaciones

alter table public.synq_change_requests
  add column if not exists request_type text not null default 'methodology'
    check (request_type in ('methodology', 'cantera', 'mixed')),
  add column if not exists resolution_note text,
  add column if not exists resolved_at timestamptz;

create index if not exists synq_change_requests_club_status_idx
  on public.synq_change_requests (club_id, status, created_at desc);

create index if not exists synq_change_requests_requested_by_idx
  on public.synq_change_requests (requested_by, created_at desc)
  where requested_by is not null;

create table if not exists public.synq_notifications (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.synq_clubs (id) on delete cascade,
  change_request_id uuid references public.synq_change_requests (id) on delete cascade,
  recipient_user_id uuid references auth.users (id) on delete cascade,
  audience text not null default 'methodology' check (
    audience in ('methodology', 'cantera', 'coach', 'all_staff')
  ),
  title text not null,
  body text not null default '',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists synq_notifications_club_created_idx
  on public.synq_notifications (club_id, created_at desc);

create index if not exists synq_notifications_recipient_unread_idx
  on public.synq_notifications (recipient_user_id, read_at)
  where recipient_user_id is not null;

alter table public.synq_notifications enable row level security;

create policy synq_notifications_select_staff
  on public.synq_notifications for select to authenticated
  using (club_id in (select public.synq_user_club_ids()));

create policy synq_notifications_insert_staff
  on public.synq_notifications for insert to authenticated
  with check (club_id in (select public.synq_user_club_ids()));

create policy synq_notifications_update_staff
  on public.synq_notifications for update to authenticated
  using (club_id in (select public.synq_user_club_ids()));
