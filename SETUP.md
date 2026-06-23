# Nexus Labs — Guía de cuentas y conexión

> **¿Solo quieres verlo ya?** → [COPIA_ESTO_EN_VERCEL.md](./COPIA_ESTO_EN_VERCEL.md)

## 1. Cuentas

| # | Cuenta | Para qué | Obligatorio día 1 |
|---|--------|----------|-------------------|
| 1 | **GitHub** SynqAISports | Código | Ya hecho |
| 2 | **Vercel** | URLs públicas | Sí |
| 3 | **Supabase** | ADN histórico Fase 1 | Sí (después del primer deploy) |

## 2. Vercel

1. https://vercel.com → **Add New** → **Project** → **SynqAISports**
2. **TrendPulse** → Root Directory: `apps/trendpulse` → Deploy
3. **Nexus** → otro proyecto → Root: `apps/nexus` → Deploy

## 3. Supabase (TrendPulse)

1. https://supabase.com → New project → EU (Frankfurt)
2. SQL Editor → ejecuta:
   `apps/trendpulse/supabase/migrations/20260623120000_trendpulse_phase1_dna.sql`
3. En Vercel (TrendPulse) → Environment Variables:

| Variable |
|----------|
| `NEXT_PUBLIC_SUPABASE_URL` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `SUPABASE_SERVICE_ROLE_KEY` |

→ Redeploy

## 4. Diseño

- **Nexus Labs**: corporativo, confianza, portfolio.
- **TrendPulse**: ágil, datos, timelines, estética radar.
