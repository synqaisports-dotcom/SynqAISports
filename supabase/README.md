# SynqAI — Supabase (proyecto B)

SynqAI usa un **proyecto Supabase nuevo**, distinto del de TrendPulse.

## Crear proyecto

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

Ejecutar en orden en el SQL Editor:

1. `supabase/migrations/20260701000000_synqai_init.sql`
2. `supabase/migrations/20260702000000_synqai_portal.sql`
3. `supabase/migrations/20260703000000_synqai_cantera.sql`

Ver también `.env.example` en la raíz del repo web y **`docs/SYNQAI_CHECKLIST_OPERATIVA.md`** (pasos manuales completos).

## Tablas

Prefijo `synq_*` — sin mezclar con tablas `trend_*` de TrendPulse.
