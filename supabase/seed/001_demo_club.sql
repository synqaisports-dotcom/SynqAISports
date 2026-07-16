-- SynqAI — club demo para modo pruebas (Vercel / local)
-- Ejecutar DESPUÉS de todas las migraciones.
-- UUID fijo: coincide con src/lib/demo-constants.ts (DEMO_CLUB_ID)

insert into public.synq_clubs (
  id,
  name,
  slug,
  country_code,
  locale_default,
  address,
  phone,
  email,
  players_count,
  family_fee_annual_eur,
  synq_rate_per_user_eur,
  invite_code,
  is_founding,
  timezone
)
values (
  '00000000-0000-4000-8000-000000000001',
  'Club Demo SynqAI',
  'club-demo-synqai',
  'ES',
  'es',
  'Calle del Fútbol 1, Madrid',
  '+34 600 000 000',
  'demo@synqai.test',
  80,
  12.00,
  0.50,
  'DEMO2026',
  true,
  'Europe/Madrid'
)
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  address = excluded.address,
  phone = excluded.phone,
  email = excluded.email,
  invite_code = excluded.invite_code;

-- Opcional: vincular tu usuario Auth como admin del club demo
-- 1. Authentication → Users → crear usuario
-- 2. Sustituir <AUTH_USER_UUID> y ejecutar:
--
-- insert into public.synq_staff (club_id, user_id, role)
-- values (
--   '00000000-0000-4000-8000-000000000001',
--   '<AUTH_USER_UUID>',
--   'admin'
-- )
-- on conflict (club_id, user_id) do update set role = excluded.role;
