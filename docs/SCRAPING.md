# Scraping Radar — TrendPulse Fase 2

## Fuentes (gratis, sin API key)

| Fuente | Qué scrapea |
|--------|----------------|
| **Google News RSS** | Noticias ES últimos 14 días por keyword |
| **Reddit JSON** | Posts recientes por búsqueda |

## Keywords monitorizadas (6)

Labubu, Dumplings, Mundial 2026 Panini, Pokémon TCG, One Piece TCG, blind box patio.

Cada hit se cruza con el **ADN histórico** (delay, perfil de ola, score).

## Activar guardado en Supabase

1. Supabase → **Settings** → **API Keys** → copia **Secret key** (`sb_secret_...`)
2. Vercel → **Environment Variables**:
   - `SUPABASE_SECRET_KEY` = secret key (solo servidor, nunca en navegador)
   - `CRON_SECRET` = una contraseña inventada (para el cron)
3. **Redeploy**

## SQL pendiente (si no lo ejecutaste)

- `supabase/migrations/20260624140000_trendpulse_phase2_radar.sql`
- `supabase/migrations/20260624160000_trendpulse_scrape_columns.sql`

## Cron automático

Cada **48h** a las 08:00 UTC → `/api/cron/ingest`

Al abrir TrendPulse también corre scrape si pasaron >48h (con secret key).

## Probar manualmente

```
https://TU-DOMINIO/api/cron/ingest
```

Con header `Authorization: Bearer TU_CRON_SECRET` si configuraste CRON_SECRET.

## Próximas fuentes (roadmap)

- TikTok Creative Center (cuando haya acceso)
- Google Trends API no oficial
- Alertas Jofemar / operadores vending (email webhook)
