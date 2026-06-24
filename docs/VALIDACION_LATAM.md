# Referencia LATAM en ADN histórico

Fechas **orientativas** para el corredor LATAM en 5 casos piloto. No tienen el mismo rigor que Labubu/Pokémon/FIFA validados para ES.

## Regla importante

**LATAM no siempre llega antes que España.** Depende del origen, del canal y del producto:

| Patrón | Cuándo suele pasar | Ejemplo en el seed |
|--------|-------------------|-------------------|
| `before` | Viral TikTok US → LATAM hispanohablante antes que patios ES | Pop It |
| `after` | Retail oficial EU antes que distribución LATAM | Pokémon SV |
| `parallel` | Evento global o lanzamiento simultáneo | FIFA 2022 |
| `before` | Hype Asia + importaciones / TikTok antes de tienda EU | Labubu |

## Casos piloto

| Slug | LATAM ref. | Relación vs ES | Notas |
|------|------------|----------------|-------|
| `labubu` | 15-oct-2024 | antes (~46d) | MX/BR coleccionistas |
| `pop-it` | 10-abr-2021 | antes (~30d) | TikTok LATAM español |
| `pokemon-tcg-sv` | 25-abr-2023 | después (~25d) | Retail LATAM tras EU |
| `fifa-stickers-2022` | 20-nov-2022 | paralelo | Semana 1 Mundial |
| `squishmallows` | 15-ago-2021 | después (~14d) | Import tras pico EU |

## SQL

Ejecutar después de las migraciones de Fase 1:

`supabase/migrations/20260625120000_trendpulse_latam_corridors.sql`

## Próximo paso radar (Fase 2b)

Fuentes tempranas planificadas (no implementadas aún):

- **China:** preventa / “próximamente” en webs de fabricante (1688, Pop Mart, tiendas DTC).
- **USA:** preventa DTC, TikTok Shop trending, bestsellers POD (Redbubble, TeePublic) como proxy de meme visual.
- **LATAM:** señal de comprobación, no asumir siempre “antes de ES”.
