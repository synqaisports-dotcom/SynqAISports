# Nexus Labs — Guía de cuentas y conexión

> **¿Solo quieres verlo ya?** → [COPIA_ESTO_EN_VERCEL.md](./COPIA_ESTO_EN_VERCEL.md)

## 1. Vercel

| App | Root Directory en Vercel |
|-----|--------------------------|
| TrendPulse | *(vacío — raíz del repo)* |
| Nexus | `apps/nexus` |

## 2. Supabase (TrendPulse)

1. https://supabase.com → New project → EU (Frankfurt)
2. SQL Editor → ejecuta:
   `supabase/migrations/20260623120000_trendpulse_phase1_dna.sql`
3. En Vercel (TrendPulse) → Environment Variables:

| Variable |
|----------|
| `NEXT_PUBLIC_SUPABASE_URL` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `SUPABASE_SERVICE_ROLE_KEY` |

→ Redeploy
