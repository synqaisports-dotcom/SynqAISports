-- Instalaciones multideporte (plataforma preparada; lanzamiento inicial fútbol).

alter table public.synq_facilities
  add column if not exists sport text not null default 'football' check (
    sport in (
      'football',
      'futsal',
      'basketball',
      'volleyball',
      'handball',
      'multisport',
      'other'
    )
  ),
  add column if not exists facility_kind text not null default 'football_11' check (
    facility_kind in (
      'football_11',
      'football_7',
      'futsal_court',
      'basketball_court',
      'volleyball_court',
      'handball_court',
      'multisport_hall',
      'gym',
      'other'
    )
  ),
  add column if not exists notes text,
  add column if not exists availability_note text;
