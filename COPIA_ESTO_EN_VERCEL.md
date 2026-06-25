# SynqAI en Vercel (`www.synqai.net`)

La rama **`main`** despliega SynqAI Sports. TrendPulse está en la rama **`trendpulse`** (otro proyecto Vercel).

## Deploy SynqAI

1. Vercel → proyecto **synqai.net** → **Settings → Git**
2. **Production Branch:** `main`
3. **Root Directory:** vacío (`./`)
4. Deploy

## Supabase SynqAI (proyecto nuevo)

Ver `supabase/README.md` — **no uses** el Supabase de TrendPulse.

Variables mínimas (cuando conectes DB):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

## TrendPulse (separado)

Ver `docs/NEXUS_ARQUITECTURA.md` y en la rama `trendpulse`: `docs/TRENDPULSE_DEPLOY.md`.
