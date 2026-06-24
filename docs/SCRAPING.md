# Scraping Radar — TrendPulse Fase 2b

## Fuentes activas (gratis, sin API key)

| Corredor | Fuente | Qué detecta |
|----------|--------|-------------|
| **ES** | Google News RSS `hl=es` | Noticias España últimos 14d |
| **US** | Google News RSS `hl=en&gl=US` | Señal temprana USA |
| **CN** | Google News RSS `hl=zh-CN&gl=CN` | Señal temprana Asia (proxy) |
| **POD** | Google News `site:redbubble.com OR teepublic.com` | Proxy meme/visual USA |
| **Reddit** | Reddit search JSON | Menciones globales + US |

## Peso por corredor (scoring)

| Canal | Peso | Motivo |
|-------|------|--------|
| China (CN) | 1.5× | Reloj largo; señal más temprana |
| USA (US) | 1.3× | TikTok/retail pipeline |
| POD | 1.2× | Proxy visual/meme |
| ES / Reddit | 1.0× | Confirmación mercado destino |

El score en tarjetas usa **hits ponderados** (`12w` = 12 weighted).

## 5 pilotos monitorizados

Labubu, Pop It, Pokémon SV, FIFA 2026, Squishmallows — alineados con ADN/LATAM.

## SQL nuevo (Fase 2b)

Ejecutar en Supabase:

`supabase/migrations/20260626120000_trendpulse_phase2b_breakdown.sql`

Añade columna `source_breakdown` (jsonb) con desglose por corredor.

## Activar guardado en Supabase

1. `SUPABASE_SECRET_KEY` en Vercel Production
2. Permisos escritura: `20260625200000_trendpulse_radar_write_grants.sql`
3. **Redeploy**

## Probar manualmente

```
https://TU-DOMINIO/api/cron/ingest
```

Respuesta esperada: `"phase": "2b"`, `signal_source` tipo `scrape:2b es:2 us:5 cn:1 ...`

## Cron automático

Cada **48h** a las 08:00 UTC → `/api/cron/ingest`

## Roadmap Fase 2c (no implementado)

- TikTok Creative Center (cuando haya acceso)
- 1688 / Pop Mart preventa directa (anti-bot)
- Google Trends no oficial
- Alertas operadores vending (email webhook)
