-- Nuevos deportes/ámbitos, tipos de instalación y flag de reservas (gimnasio, fisioterapia).

alter table public.synq_facilities
  add column if not exists supports_reservations boolean not null default false;

alter table public.synq_facilities drop constraint if exists synq_facilities_sport_check;
alter table public.synq_facilities drop constraint if exists synq_facilities_facility_kind_check;

alter table public.synq_facilities add constraint synq_facilities_sport_check check (
  sport in (
    'football',
    'futsal',
    'basketball',
    'volleyball',
    'handball',
    'waterpolo',
    'fitness',
    'physiotherapy',
    'training',
    'club_admin',
    'multisport',
    'other'
  )
);

alter table public.synq_facilities add constraint synq_facilities_facility_kind_check check (
  facility_kind in (
    'football_11',
    'football_7',
    'futsal_court',
    'basketball_court',
    'volleyball_court',
    'handball_court',
    'waterpolo_pool',
    'multisport_hall',
    'gym',
    'physiotherapy_room',
    'training_classroom',
    'meeting_room',
    'club_offices',
    'other'
  )
);

update public.synq_facilities
set supports_reservations = true
where facility_kind in ('gym', 'physiotherapy_room');
