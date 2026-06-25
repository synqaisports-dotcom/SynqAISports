# TrendPulse — deploy independiente

TrendPulse vive en la rama **`trendpulse`**. No comparte base de datos ni deploy con SynqAI.

## GitHub

| Rama | Producto |
|------|----------|
| `trendpulse` | TrendPulse (delay intelligence, patio) |
| `main` | SynqAI Sports (`www.synqai.net`) |

## Vercel

1. Proyecto **TrendPulse** → rama `trendpulse`, Root Directory vacío (`./`)
2. Crons activos solo aquí (`vercel.json`: ingest cada 48h, marketplace)
3. URL sugerida: `trendpulse.vercel.app` o subdominio propio

## Supabase (proyecto A — solo TrendPulse)

Usa el proyecto Supabase **actual** con tablas `trend_*`.

Variables en Vercel (proyecto TrendPulse):

| Variable | Uso |
|----------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto TrendPulse |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Lectura |
| `SUPABASE_SECRET_KEY` | Crons, scrape, escritura |

Migraciones: carpeta `supabase/migrations/` de esta rama.

## UI

- **Tendencias** y **Radar**: listados compactos; ficha completa en `/tendencias/[slug]` y `/radar/[slug]`.

## Nexus Labs

Marca paraguas (landing en `apps/nexus`). TrendPulse y SynqAI son productos separados bajo el sello.
