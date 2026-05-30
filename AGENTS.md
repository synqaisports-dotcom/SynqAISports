# AGENTS.md

Guía para agentes de desarrollo en el repositorio **SynqAI Sports** (Next.js monolith).

## Cursor Cloud specific instructions

### Arquitectura

Monolito **Next.js 15** (App Router) + **React 19**. No hay `docker-compose` ni backend separado: UI y APIs viven en `src/app/` y `src/app/api/`. Datos Pro usan **Supabase** (auth + Postgres); flujos freemium usan `localStorage` / sql.js en el navegador.

### Servicios

| Servicio | Comando | Puerto / notas |
|----------|---------|----------------|
| App web (obligatorio) | `npm run dev` | **9002** (`next dev -p 9002`) |
| Genkit UI (opcional) | `npm run genkit:dev` | Solo depuración de flujos IA |
| Supabase (opcional E2E Pro) | Proyecto cloud + migraciones en `supabase/migrations/` | Variables en `.env.local` |

Sin Supabase, el middleware entra en **modo demo** (`src/middleware.ts`): rutas como `/store`, `/smartwatch` y `/sandbox-portal` funcionan; `/dashboard` y `/admin-global` degradan o redirigen según layout cliente.

### Variables de entorno

Crear `.env.local` en la raíz (no está en el repo). Mínimo para Pro/auth real:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (APIs admin/sync)

Opcionales: `GOOGLE_GENAI_API_KEY` (Genkit/Gemini), `NEXT_PUBLIC_GOOGLE_ADSENSE_*` (anuncios).

### Comandos habituales

Ver `package.json`. Resumen:

- **Dev:** `npm run dev` → http://localhost:9002
- **Build:** `npm run build` (Next compila aunque `npm run typecheck` falle por errores TS preexistentes en torneos)
- **Lint:** `npm run lint` (puede fallar con `Converting circular structure to JSON` en `.eslintrc.json` + `eslint-config-next` 16)
- **Tests:** `npm test` (`tsx --test src/**/*.test.ts`)
- **Typecheck:** `npm run typecheck`

### Arrancar el servidor en sesiones Cloud

Usar **tmux** para procesos largos:

```bash
SESSION_NAME="next-dev-server"
tmux -f /exec-daemon/tmux.portal.conf has-session -t "=$SESSION_NAME" 2>/dev/null \
  || tmux -f /exec-daemon/tmux.portal.conf new-session -d -s "$SESSION_NAME" -c "/workspace" -- bash -lc "npm run dev"
```

Comprobar: `curl -sf http://localhost:9002/store`

### Hello world sin Supabase

1. Abrir `/store` — catálogo de micro-apps (4 tarjetas).
2. Abrir `/smartwatch` — emparejamiento por PIN (interactivo).
3. Abrir `/sandbox-portal` — entrada SANDBOX COACH (onboarding local).

Rutas `/board/*` pueden redirigir a `/login` en el cliente aunque el middleware las trate como públicas; para pizarra sin login usar el flujo sandbox.

### Node

El proyecto declara Node 20 en `.idx/dev.nix`; **Node 22** en la VM funciona con las dependencias actuales.

### Android / Capacitor

Opcional. Requiere Android SDK/Java. WebView apunta a `CAPACITOR_SERVER_URL` o producción. Ver scripts `cap:*` en `package.json`.
