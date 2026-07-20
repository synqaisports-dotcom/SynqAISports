# Arquitectura multideporte — SynqAI Sports

Documento de referencia para la creación de base de datos y evolución del portal.
**Versión:** 2026-07-20 · **Migración:** `20260720180000_multisport_architecture.sql`

---

## Principios

1. **Un club, un portal** — no replicar aplicaciones por deporte.
2. **`practiced_sports`** en `synq_clubs` define qué deportes ve el club (ya implementado).
3. **Deporte como dimensión** en equipos, asignaciones de jugador, metodología y pizarras.
4. **Alta habitual mono-deporte** — default `['football']`; multideporte es opcional.
5. **Compatibilidad** — `synq_players.team_id`, `jersey_number`, `position` se mantienen como copia de la asignación principal (`is_primary`).

---

## Modelo de datos (nuevo / ampliado)

### `synq_clubs` (existente)

| Columna | Tipo | Notas |
|---------|------|-------|
| `practiced_sports` | `text[]` | Mín. 1. Valores: `football`, `futsal`, `basketball`, `volleyball`, `handball`, `waterpolo` |

### `synq_player_team_memberships` (NUEVA)

Vincula jugador ↔ equipo con datos deportivos por asignación.

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | uuid PK | |
| `club_id` | uuid FK → synq_clubs | |
| `player_id` | uuid FK → synq_players | |
| `team_id` | uuid FK → synq_teams | |
| `sport` | text | Redundante con `synq_teams.sport`; facilita consultas |
| `jersey_number` | int | Por equipo/deporte |
| `position` | text | Códigos según catálogo del deporte |
| `is_primary` | boolean | Una sola `true` por jugador |
| `active` | boolean | |
| `joined_at` | timestamptz | |
| `created_at`, `updated_at` | timestamptz | |

**Constraints:**
- `UNIQUE (player_id, team_id)`
- Opcional futuro: `UNIQUE (team_id, jersey_number) WHERE active`

**RLS:** mismo patrón `synq_user_club_ids()` que jugadores.

**Backfill:** desde `synq_players` donde `team_id IS NOT NULL`.

### `synq_teams.sport` (ampliado)

Antes: `football | futsal`  
Ahora: `football | futsal | basketball | volleyball | handball | waterpolo`

### `synq_exercises` (ampliado)

| Columna nueva | Tipo | Default |
|---------------|------|---------|
| `sport` | text | `'football'` |

Filtrar biblioteca de ejercicios por deporte del club.

### `synq_microcycles` (ampliado)

| Columna nueva | Tipo | Notas |
|---------------|------|-------|
| `sport` | text NOT NULL | Heredado de `team_id` o `'football'` en plantillas |

### `synq_methodology_objectives` (ampliado)

| Cambio | Detalle |
|--------|---------|
| PK | De `club_id` → `(club_id, sport)` |
| Columna `sport` | text NOT NULL DEFAULT `'football'` |

`objectives_json` sigue siendo mapa `category_slug → objetivos`.

### `synq_periodization_plans` (ampliado)

| Cambio | Detalle |
|--------|---------|
| PK | De `(club_id, category_slug)` → `(club_id, sport, category_slug)` |
| Columna `sport` | text NOT NULL DEFAULT `'football'` |

---

## Capas de aplicación

```
synq_clubs.practiced_sports
        │
        ├── Catálogos por deporte (posiciones, pizarras)  → src/lib/sport-positions.ts
        ├── Equipos (synq_teams.sport)
        ├── Asignaciones jugador (synq_player_team_memberships)
        ├── Metodología (sport en exercises, microcycles, objectives)
        └── Contexto activo (?sport=football)             → src/lib/sport-context.ts
```

### Catálogos de posiciones

Definidos en código (`src/lib/sport-positions.ts`), no en BBDD por ahora.

| Deporte | Estado catálogo |
|---------|-----------------|
| football | Completo (POR, MC, DL…) |
| futsal | Reutiliza fútbol |
| basketball | Base (BASE, ESC, ALA…) |
| volleyball | Base (COL, OP, CEN…) |
| handball | Base |
| waterpolo | Base |

### Pizarras (drawing)

| Deporte | Plantillas | Estado |
|---------|------------|--------|
| football | F11, F7, medio, tercio | Producción |
| futsal | Pista sala | Producción |
| Resto | — | `boardReady: false` en `club-practiced-sports.ts` |

Función `fieldTemplatesForPracticedSports()` preparada para filtrar el estudio de dibujo.

---

## Flujos funcionales

### Alta de club
1. Default `practiced_sports = ['football']`.
2. UI multiselect solo si el club necesita más deportes.

### Crear jugador
1. Insert `synq_players` (datos personales).
2. Si hay `team_id`: insert `synq_player_team_memberships` con `is_primary = true`.
3. Sincronizar `players.jersey_number`, `position` desde membresía principal.

### Jugador multideporte
1. Varias filas en `synq_player_team_memberships` (distinto `team_id` / `sport`).
2. Una sola `is_primary = true` — define vista por defecto en listados.
3. Ficha muestra bloque «Otras asignaciones» si `memberships.length > 1`.

### Metodología
1. Ejercicios y microciclos etiquetados con `sport`.
2. Listados filtrados por `?sport=` o primer deporte del club.
3. Objetivos y periodización por `(club_id, sport, category_slug)`.

---

## Archivos de aplicación tocados

| Área | Archivos |
|------|----------|
| Migración | `supabase/migrations/20260720180000_multisport_architecture.sql` |
| Documentación | `docs/MULTISPORT_ARQUITECTURA.md` |
| Libs | `player-memberships.ts`, `sport-positions.ts`, `sport-context.ts`, `demo-memberships.ts`, `club-practiced-sports.ts`, `player-positions.ts`, `player-profile.ts`, `player-teams.ts`, `microcycle-page-data.ts` |
| Actions | `cantera.ts` (sync memberships), `methodology.ts` (sport en exercises/microcycles/objectives) |
| UI | `PlayerPositionsPicker.tsx`, `PlayersMasterDetail.tsx`, `PlayerCreateForm.tsx`, `ExercisesMasterDetail.tsx`, `ExerciseEditor.tsx`, `ObjectivesMasterDetail.tsx`, `CategoryObjectivesForm.tsx` |
| Páginas | `jugadores/page.tsx`, `metodologia/ejercicios/page.tsx`, `metodologia/ejercicios/nuevo/page.tsx`, `metodologia/objetivos/page.tsx` |

---

## Orden de despliegue BBDD

1. Ejecutar migraciones en orden cronológico hasta `20260720180000`.
2. Verificar backfill de `synq_player_team_memberships`.
3. Verificar PK nuevas en objectives y periodization.
4. Probar club mono-deporte (solo fútbol) — sin cambios visibles para el usuario.
5. Probar club multideporte con dos asignaciones de jugador.

---

## Roadmap pendiente (no en esta entrega)

- [ ] UI para añadir segunda asignación deportiva a un jugador existente
- [ ] Selector de contexto deportivo en header (solo si `practiced_sports.length > 1`)
- [ ] Plantillas de pizarra baloncesto, voleibol, etc.
- [ ] Tests automatizados (Vitest/Playwright) — ver sección Testing
- [ ] Sincronización app Android Coach con memberships

---

## Testing

El proyecto **no tiene suite de tests web** configurada actualmente (no Jest/Vitest/Playwright en `package.json`).

**Qué puede hacer el agente de desarrollo:**
- `npm run build` — compilación y tipos
- `npm run lint` — si está configurado
- Revisión manual de flujos vía código y demo

**Qué no sustituye un tester humano:**
- UX real multideporte
- Regresiones visuales
- Carga y permisos RLS en Supabase real

**Recomendación:** añadir Vitest para libs (`sport-positions`, `player-memberships`, validaciones) y Playwright para flujos críticos (alta jugador, crear ejercicio) cuando el portal esté más estable.
