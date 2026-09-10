# Torneos — Esquema de base de datos (Supabase)

Migración: `supabase/migrations/20260729120000_tournaments_module.sql`

## Resumen

Módulo multisport de torneos con:

- Fase de **grupos** (round-robin)
- **Finales paralelas** por puesto en grupo (Platinum, Gold, Silver, Bronze, Consolación)
- Equipos invitados con portal delegado
- Mesa móvil (PWA) por partido
- Ticketing QR + taquilla
- Dossiers (invitación / oficial)
- Signage scoped al torneo

## Diagrama de relaciones

```
synq_tournaments
├── synq_tournament_categories
│   ├── synq_tournament_phases
│   │   └── synq_tournament_groups
│   └── synq_tournament_teams
├── synq_tournament_fields
├── synq_tournament_sponsors
├── synq_tournament_matches  (→ phase, group, teams, field)
├── synq_tournament_dossiers
├── synq_tournament_ticket_types
├── synq_tournament_tickets
└── synq_tournament_access_tokens

synq_signage_playlists.tournament_id  (scope = 'tournament')
```

## Tablas

### `synq_tournaments`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | uuid PK | |
| `club_id` | uuid FK → synq_clubs | Organizador |
| `tenant_type` | text | `club`, `standalone`, `api_external` |
| `name`, `slug` | text | Nombre y URL pública única |
| `sport_key` | text | Deporte principal (`football`, `basketball`…) |
| `status` | text | `draft` → `finished` / `cancelled` |
| `starts_at`, `ends_at` | timestamptz | Fechas del evento |
| `format_json` | jsonb | Config de formato (weekend, multifinal…) |
| `registration_config_json` | jsonb | Plazos, cupos |
| `ticketing_config_json` | jsonb | Proyección asistencia, taquilla |
| `revenue_estimates_json` | jsonb | Estimaciones ticketing + patrocinio + signage |
| `public_enabled` | boolean | Web pública activa |

### `synq_tournament_categories`

Categorías dentro del torneo (Sub-10, Sub-12…).

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `groups_count` | int 1–16 | Número de grupos |
| `teams_per_group` | int 2–8 | Equipos por grupo |
| `format_type` | text | `groups_multifinal` (principal), `league`, `knockout`, `groups_knockout` |
| `placement_brackets_json` | jsonb | Bandejas por puesto: `[{ position, name, bracket_key, color? }]` |

**Ejemplo** 6 grupos × 4 equipos → 4 bandejas (1º Platinum, 2º Gold, 3º Silver, 4º Bronze) + Consolación.

### `synq_tournament_phases`

Fases de competición por categoría.

| `phase_type` | Uso |
|--------------|-----|
| `group` | Fase de grupos |
| `placement_bracket` | Bandeja por puesto (Platinum, Silver…) |
| `semifinal`, `final`, `third_place`, `consolation` | Subfases (metadata; rondas en partidos) |

`bracket_key`: identificador único por categoría (`groups`, `p1`, `p2`, `consolation`…).

### `synq_tournament_matches`

| `round_key` | Ronda |
|-------------|-------|
| `group` | Liga dentro del grupo |
| `r16`, `qf`, `sf` | Eliminatorias |
| `final` | Final de bandeja |
| `third_place` | 3.er puesto |
| `consolation_final` | Final de consolación |

`mesa_token`: acceso PWA mesa sin login de club.

### `synq_tournament_teams`

Equipos invitados. `invite_token` → portal delegado (`/torneo/equipo/[token]`).

`squad_json`: `[{ id, name, dorsal, position? }]`.

### `synq_tournament_access_tokens`

Tokens globales: `mesa`, `gate` (taquilla), `delegate`.

### Ticketing

- `synq_tournament_ticket_types`: tipos (día, partido, torneo)
- `synq_tournament_tickets`: entradas emitidas con `qr_code_hash` + `qr_payload`

### Signage

`alter table synq_signage_playlists add tournament_id` y `scope = 'tournament'`.

## RLS

- **Staff**: acceso vía `synq_user_club_ids()` en torneos del club.
- **Anon**: lectura de torneos con `public_enabled = true` y `status <> 'draft'` (partidos, equipos, categorías, campos, patrocinadores, fases, grupos).

Escritura pública (mesa, delegado) se hace vía **Server Actions** con validación de token, no RLS anon directo.

## Aplicar migración

```bash
# Local / CLI
supabase db push

# O bundle para despliegue manual
npm run supabase:bundle
```

## Código relacionado

| Archivo | Rol |
|---------|-----|
| `src/lib/tournaments.ts` | Tipos y constantes |
| `src/lib/tournament-brackets.ts` | Generador grupos + multifinal |
| `src/lib/tournament-access.ts` | Tokens, URLs, QR |
| `src/lib/demo-tournaments-store.ts` | Datos demo |
| `src/app/actions/tournaments.ts` | Server actions |
| `docs/TORNEOS_MODULO.md` | Guía funcional |

## Índices clave

- `synq_tournaments(slug)`, `(club_id)`, `(status)`
- `synq_tournament_matches(tournament_id)`, `(scheduled_at)`, `(mesa_token)`
- `synq_tournament_teams(invite_token)` partial

## Notas de diseño

1. **Multifinal**: tras grupos, cada puesto forma su propia eliminatoria; no se mezclan 1º con 2º.
2. **Cruces**: dentro de cada bandeja, emparejamiento serpentino entre grupos (1A, 1B… 1F) con byes si no es potencia de 2.
3. **Consolación**: bandeja adicional para últimos puestos o perdedores según configuración.
4. **PWA-first**: mesa y taquilla son rutas públicas con token; preparado para Capacitor futuro.
