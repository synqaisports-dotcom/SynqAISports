# SynqAI — Supabase

SynqAI usa un **proyecto Supabase independiente** de TrendPulse (tablas `synq_*`).

**Guía completa desde cero:** `docs/SUPABASE_VERCEL_DESDE_CERO.md`

## Entornos recomendados

| Proyecto Supabase | Uso |
|-------------------|-----|
| `synqai-staging` | Desarrollo, QA, Preview Vercel |
| `synqai-prod` | Producción en `www.synqai.net` |

Mismas migraciones en ambos; solo cambian las variables por entorno.

## Setup rápido

```bash
# 1. Crear proyecto en supabase.com/dashboard
# 2. Generar SQL único
npm run supabase:bundle
# 3. Pegar supabase/.bundle/full_schema.sql en SQL Editor → Run
# 4. (Opcional demo) Ejecutar supabase/seed/001_demo_club.sql
# 5. Copiar URL + keys a Vercel / .env.local
```

## Variables

| Variable | Obligatoria | Notas |
|----------|-------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Sí | Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Sí | Alias: `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `SUPABASE_SERVICE_ROLE_KEY` | Demo con persistencia | Alias: `SUPABASE_SECRET_KEY`. Solo servidor |
| `SYNQ_VERCEL_DEMO` | Demo en Vercel | `true` = portal sin login |
| `NEXT_PUBLIC_SYNQ_DEMO_MODE` | Demo local | Mismo efecto que arriba |
| `SYNQ_DEMO_CLUB_ID` | No | UUID club en `synq_clubs` |

## Migraciones (29 archivos — orden alfabético)

1. `20260701000000_synqai_init.sql`
2. `20260702000000_synqai_portal.sql`
3. `20260703000000_club_media_storage.sql`
4. `20260703000000_synqai_cantera.sql`
5. `20260704000000_club_social_urls.sql`
6. `20260704000000_synqai_methodology.sql`
7. `20260704010000_club_instagram_url.sql`
8. `20260705000000_club_organigrama_json.sql`
9. `20260705000000_synqai_exercise_sheet.sql`
10. `20260706000000_club_people.sql`
11. `20260706010000_club_people_profile.sql`
12. `20260706020000_person_assignments.sql`
13. `20260706030000_team_category_slug.sql`
14. `20260706040000_team_letter_player_names.sql`
15. `20260706050000_facilities_team_venue.sql`
16. `20260706060000_facilities_multisport.sql`
17. `20260706070000_facilities_days_venue.sql`
18. `20260706080000_facilities_division_schedule.sql`
19. `20260707000000_player_guardians.sql`
20. `20260707010000_player_medical.sql`
21. `20260707020000_player_history.sql`
22. `20260707030000_team_history.sql`
23. `20260707040000_club_material.sql`
24. `20260709000000_methodology_objectives.sql`
25. `20260710000000_periodization_plans.sql`
26. `20260711000000_periodization_variant_links.sql`
27. `20260712000000_team_microcycle_forks.sql`
28. `20260713000000_change_requests_inbox.sql`
29. `20260713000000_microcycle_session_slots.sql`

> Archivos con el mismo timestamp: ejecutar en orden alfabético del nombre completo.

## Storage

- Bucket `club-media` (público) — migración `20260703000000_club_media_storage.sql`

## Primer usuario (login real)

Ver `docs/SUPABASE_VERCEL_DESDE_CERO.md` §6.
