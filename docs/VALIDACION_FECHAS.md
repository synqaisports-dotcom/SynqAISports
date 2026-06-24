# Validación de fechas — 3 casos piloto (jun 2026)

Criterio TrendPulse: **pico origen** = máximo hype en región de origen; **pico ES** = máximo demanda retail/vending en España.

---

## 1. Labubu Blind Box

| Campo | Antes | Después | Fuente |
|-------|-------|---------|--------|
| Señal origen | jul 2024 | **abr 2024** | Lisa/Blackpink impulso global ([BBC](https://www.bbc.com/news/articles/cy4ydxlm9n9o)) |
| Pico origen | sep 2024 | **ago 2024** | Inflexión Google Trends / menciones SEA |
| Pico ES | oct 2024 | **30 nov 2024** | Apertura pop-up Barcelona, colas 6h ([Timeout](https://www.timeout.es/barcelona/es/noticias/abre-en-barcelona-la-tienda-de-sonny-angels-y-se-forman-colas-de-mas-de-dos-horas-120224)) |
| Delay | 45d | **~121d** | ago 2024 → 30 nov 2024 |
| Caída | dic 2024 | **mar 2025** | Cierre pop-up extendido ([Idealista](https://www.idealista.com/news/inmobiliario/retail/2024/11/20/821376-los-sonny-angels-y-los-labubu-aterrizan-en-barcelona-popmart-abre-una-tienda-en-plaza)) |

**Lectura vending:** el delay real a España fue **mayor** de lo estimado inicialmente; la ventana útil empieza **antes** del hype máximo en Asia (abr–ago), no en sep.

---

## 2. Pokémon TCG Scarlet & Violet

| Campo | Antes | Después | Fuente |
|-------|-------|---------|--------|
| Señal origen | mar 2023 | **20 ene 2023** | Lanzamiento JP ([WikiDex](https://www.wikidex.net/wiki/Escarlata_y_P%C3%BArpura_(TCG):_Escarlata_y_P%C3%BArpura)) |
| Pico origen | abr 2023 | **mar 2023** | Pre-lanzamiento EU / pico JP |
| Lanzamiento ES | — | **31 mar 2023** | Oficial Pokémon ES |
| Pico ES | jul 2023 | **15 may 2023** | ~6 sem post-lanzamiento (demanda vending/hobby) |
| Delay pico | 96d | **~75d** | mar → may 2023 |
| Delay lanzamiento oficial | — | **70d** | 20 ene JP → 31 mar ES |

**Lectura vending:** el pico de **jul 2023** mezclaba ola 151 (sep); para SV base, el micro-lote óptimo es **abril–mayo 2023**.

---

## 3. FIFA World Cup Stickers 2022

| Campo | Antes | Después | Fuente |
|-------|-------|---------|--------|
| Pico origen | 1 nov | **20 nov 2022** | Arranque Mundial Qatar |
| Pico ES | 20 nov | **27 nov 2022** | Semana 1 torneo, agotamientos ES |
| Delay | 19d | **~7d** | Evento global casi simultáneo |

**Lectura vending:** perfil **estacional masiva** — delay mínimo; la ventana es corta y ligada al calendario del evento ([elDiario / Panini ES](https://www.eldiario.es/economia/mundial-futbol-dispara-ventas-panini-agota-cromos-fabricamos-24-horas-dia-no-esperabamos_1_13261227.html)).

---

## Aplicar en Supabase

Ejecuta en SQL Editor:

`supabase/migrations/20260624120000_validate_three_cases.sql`

O raw: https://raw.githubusercontent.com/synqaisports-dotcom/SynqAISports/main/supabase/migrations/20260624120000_validate_three_cases.sql
