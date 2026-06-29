# SynqAI — Supabase (proyecto B)

SynqAI usa un **proyecto Supabase nuevo**, distinto del de TrendPulse.

> **Importante (junio 2026):** Estamos en fase de **cáscaras** — las migraciones de este directorio están **preparadas en el repo** pero **no deben ejecutarse** hasta cerrar la UI y conectar de una vez en **staging** y luego **producción**. Ver `docs/ESTRATEGIA_CASCARAS_Y_BASE_DE_DATOS.md`.

## Entornos previstos

| Proyecto Supabase | Uso |
|-------------------|-----|
| **Staging** (pruebas) | Desarrollo, QA, preview Vercel |
| **Producción** | Clubes reales en `www.synqai.net` |

Cada uno con sus propias variables `NEXT_PUBLIC_SUPABASE_*` en Vercel.

## Crear proyecto (cuando toque la fase datos)

1. [supabase.com/dashboard](https://supabase.com/dashboard) → **New project** → nombre ej. `synqai-sports`
2. SQL Editor → pegar y ejecutar `supabase/migrations/20260701000000_synqai_init.sql`
3. **Project Settings → API** → copiar URL y Publishable key

## Variables en Vercel (proyecto SynqAI / `www.synqai.net`)

| Variable | Valor |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto **SynqAI** |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key SynqAI |
| `SUPABASE_SECRET_KEY` | Secret key SynqAI (solo cuando haya escritura server-side) |

**No reutilices** las credenciales del proyecto TrendPulse.

## Migraciones

Ejecutar **todas en orden** en el SQL Editor del entorno **staging** primero; validar; luego repetir en **producción**.

1. `supabase/migrations/20260701000000_synqai_init.sql`
2. `supabase/migrations/20260702000000_synqai_portal.sql`
3. `supabase/migrations/20260703000000_club_media_storage.sql`
4. `supabase/migrations/20260703000000_synqai_cantera.sql`
5. `supabase/migrations/20260704000000_club_social_urls.sql`
6. `supabase/migrations/20260704000000_synqai_methodology.sql`
7. `supabase/migrations/20260704010000_club_instagram_url.sql`
8. `supabase/migrations/20260705000000_club_organigrama_json.sql`
9. `supabase/migrations/20260705000000_synqai_exercise_sheet.sql`
10. `supabase/migrations/20260706000000_club_people.sql`
11. `supabase/migrations/20260706010000_club_people_profile.sql`
12. `supabase/migrations/20260706020000_person_assignments.sql`
13. `supabase/migrations/20260706030000_team_category_slug.sql`
14. `supabase/migrations/20260706040000_team_letter_player_names.sql`
15. `supabase/migrations/20260706050000_facilities_team_venue.sql`
16. `supabase/migrations/20260706060000_facilities_multisport.sql`
17. `supabase/migrations/20260706070000_facilities_days_venue.sql`
18. `supabase/migrations/20260706080000_facilities_division_schedule.sql`

Ver también `.env.example` y **`docs/SYNQAI_CHECKLIST_OPERATIVA.md`**.

### Migraciones (referencia histórica — lista corta antigua)

Si ya ejecutaste migraciones anteriores en un entorno de prueba, solo añade las que falten. Lista mínima original:

1. `20260701000000_synqai_init.sql`
2. `20260702000000_synqai_portal.sql`
3. `20260703000000_synqai_cantera.sql`
4. `20260704000000_synqai_methodology.sql`

## Tablas

Prefijo `synq_*` — sin mezclar con tablas `trend_*` de TrendPulse.
