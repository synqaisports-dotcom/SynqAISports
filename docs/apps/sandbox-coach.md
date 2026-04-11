# SANDBOX COACH

## Propósito

Micro-app **tablet-first** para entrenadores: Command Hub operativo, equipo, tareas tácticas (vault), agenda de sesiones, partidos, estadísticas locales, continuidad móvil y pizarras (promo + partido). Modelo **local-first** (`localStorage`) con cola de eventos para publicidad/analítica y enlaces a smartwatch.

## Catálogo Store

- **Slug:** `sandbox-coach`
- **Href:** `/sandbox-portal?dest=/sandbox/app`
- **accessMode (catálogo):** `open`  
  **Importante:** la ruta `/sandbox/app` exige sesión vía `SandboxAppClientWrapper` → redirección a `/sandbox/login` si no hay perfil. El modo “open” del Store no elimina este guard; alinear catálogo o código si se quiere acceso sin login.

## Base path (app independiente)

- Variable opcional: `NEXT_PUBLIC_SANDBOX_BASE_PATH` (por defecto `/sandbox`).  
- Rutas internas del Command Hub y login deben usar `src/lib/sandbox-routes.ts` (`sandboxAppHref`, `sandboxLoginHref`, `SANDBOX_APP_ROOT`, etc.).

## Captura de lead en login

- `/sandbox/login`: formulario (club, país, ciudad, dirección, email) → `POST /api/sandbox/lead` (Supabase tabla `sandbox_terminal_leads` si existe migración + `SUPABASE_SERVICE_ROLE_KEY`).  
- Copia local en `localStorage` `synq_sandbox_terminal_lead_v1` si el envío falla o no hay backend.

## Rutas principales

| Ruta | Función |
|------|---------|
| `/sandbox-portal` | Portal: si hay sesión, redirige a `dest` (default `/sandbox/app`); si no, pantalla + login |
| `/sandbox/login` | Terminal: lead capture + enlace a OAuth global `/login?next=…` |
| `/sandbox/app` | Command Hub (KPIs, gráficas, monetización, iframe pizarra partido, PWA install) |
| `/sandbox/app/team` | Mi equipo (formación, titulares, suplentes) |
| `/sandbox/app/tasks` | Mis tareas (slots por bloque, enlace a pizarra promo) |
| `/sandbox/app/sessions` | Agenda (hasta 4 sesiones compuestas desde tareas) |
| `/sandbox/app/matches` | Mis partidos (hasta 20; enlace a pizarra partido `source=sandbox`) |
| `/sandbox/app/stats` | Estadísticas derivadas de partidos jugados + XP local |
| `/sandbox/app/mobile-continuity` | Modo continuidad (cronómetro, marcador, incidencias, QR smartwatch) |
| `/sandbox/app/watch-config` | Config watch (reexport promo; no en NAV del shell) |
| `/sandbox/app/collaboration` | Colaboración promo (no en NAV del shell) |
| `/sandbox/app/board/promo` | Pizarra táctica de ejercicios / tareas |
| `/sandbox/app/board/match` | Pizarra partido en vivo (`matchId`, `embed`, `fullscreen`, …) |

**Legacy compartido:** mismas pantallas promo bajo `/dashboard/promo/*` con resolución de base path en cliente.

## Autenticación

- Supabase + `useAuth` / `AuthProvider` (misma identidad que el resto de la plataforma).
- Guard en `(shell)` y `board`: `SandboxAppClientWrapper`.

## Persistencia local (clave)

| Clave | Contenido |
|-------|-----------|
| `synq_promo_team` | Plantilla: tipo campo, formación, datos club, titulares, suplentes |
| `synq_promo_vault` | `exercises`, `sessions`, `matches` (+ a veces `team` embebido) |

Límites típicos en código: 20 ejercicios totales; 4 sesiones; 20 partidos; slots por bloque (warmup/main/cooldown).

## Pizarra partido (sandbox)

- Query: `source=sandbox`, `matchId`, opcional `embed`, `fullscreen`.
- Roster desde `synq_promo_team`; marcador puede sincronizarse con el vault al guardar.
- Sincronización tiempo/marcador con otras pestañas y smartwatch vía claves en `src/lib/match-timer-sync.ts` y `match-score-sync.ts` (scope según contexto).

## PWA

- Manifest: `/sandbox/manifest.json` (`start_url` `/sandbox/app`, scope `/sandbox`).
- Service worker: `/sw.js` (versión de caché en código).
- Banner instalación según ruta (`sandbox-shell-with-banner`, layout board).

## Monetización y analítica

- AdSense opcional (`NEXT_PUBLIC_GOOGLE_ADSENSE_*`).
- `synqSync` → `/api/ads/events` → `ad_events_queue` (con fallback anon en preview).
- Placements con prefijo `sandbox_*` por página (team, tasks, sessions, matches, stats, continuity).

## UI compartida

- Shell: `SandboxCommandHubShell`, estética Command Hub.
- Paneles promo: `src/app/dashboard/promo/command-hub-ui.tsx` (`HubPanel`, `SectionBar`, `PromoAdsPanel`).

## Archivos de referencia

- Catálogo: `src/lib/store-catalog.ts`
- Portal: `src/app/sandbox-portal/page.tsx`
- Login: `src/app/sandbox/login/page.tsx`
- Shell: `src/app/sandbox/app/sandbox-command-hub-shell.tsx`
- Auth guard: `src/app/sandbox/app/sandbox-app-client-wrapper.tsx`
- Board layout: `src/app/sandbox/app/board/layout.tsx`
- Pizarra partido: `src/app/board/match/page.tsx`
- Cola eventos: `src/lib/sync-service.ts`
