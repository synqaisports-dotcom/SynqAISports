# Reporte de trabajo autónomo — SynqAI

## 2026-04-11 — Bloque: Fase 1 (Roadmap + clasificación + blindaje ads + shared UI)

### Tareas completadas (roadmap)

- Creado `docs/DELIVERABLES_ROADMAP.md` con 4 fases, criterios de aceptación y estados.
- Creado `docs/PLAN_MAESTRO.md` con clasificación WEB-ONLY / VISUALIZADORES / NATIVO-CANDIDATE.
- Política central `src/lib/ads-policy.ts` (`shouldAllowAdsenseWeb`, `getAdsWebZone`, `canShowAds` para pizarra training) y hook `src/hooks/use-ads-allowed.ts`.
- `PromoAdsPanel` centralizado en `src/components/shared/command-hub-ui.tsx` con bloqueo de AdSense fuera de rutas permitidas.
- Eliminada duplicación del bloque AdSense en `src/app/sandbox/app/(shell)/page.tsx` (ahora usa `PromoAdsPanel`).
- Pizarra promo `src/app/board/promo/page.tsx`: script y slots condicionados a `useAdsAllowed()`.
- `src/app/dashboard/promo/command-hub-ui.tsx` convertido en reexport hacia `shared` (imports existentes siguen válidos).
- READMEs de segmento bajo `src/app/*/README.md` y `src/components/shared/README.md`.
- Actualizado `docs/apps/sandbox-coach.md` (ruta del componente compartido).

### Archivos tocados / nuevos

- Nuevos: `src/lib/ads-policy.ts`, `src/hooks/use-ads-allowed.ts`, `src/components/shared/command-hub-ui.tsx`, `docs/DELIVERABLES_ROADMAP.md`, `docs/PLAN_MAESTRO.md`, `REPORT_LOG.md`, READMEs en `src/app/` y `src/components/shared/`.
- Modificados: `src/app/dashboard/promo/command-hub-ui.tsx`, `src/app/sandbox/app/(shell)/page.tsx`, `src/app/board/promo/page.tsx`, `src/app/sandbox/login/page.tsx`, `docs/apps/sandbox-coach.md`.

### GUÍA DE TEST (validación manual)

1. **Sandbox con ads:** Con `.env` con `NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT` y slot, abre `/sandbox/app` (logueado). Debe verse el panel de monetización y cargar/redimensionar el slot como antes.
2. **Dashboard promo sin ads web:** Abre `/dashboard/promo/team` (logueado). El panel “Monetización” debe mostrar el mensaje gris de política (sin `adsbygoogle.js` en red: inspeccionar pestaña Network, filtrar `googlesyndication`).
3. **Pizarra promo:** Abre `/board/promo`. Debe comportarse como antes con anuncios. Si en el futuro esta ruta se moviera bajo un prefijo bloqueado, los anuncios deben cortarse (comprobar política).
4. **Continuidad con ads:** Abre `/dashboard/mobile-continuity`. Si hay variables AdSense, debe seguir pudiendo mostrar `PromoAdsPanel` (ruta explícitamente permitida en `ads-policy`).
5. **Regresión TypeScript:** `npm run build` o `npx tsc --noEmit` sin errores.

### Bloqueos técnicos

- Ninguno para Fase 1.

---

## 2026-04-11 — Bloque: Fase 3–4 (SQLite + outbox + API)

### Tareas completadas (roadmap)

- **Fase 3** marcada **En proceso** en `docs/DELIVERABLES_ROADMAP.md`; **Fase 4** también en proceso (outbox + endpoint).
- Dependencia **`sql.js`** + **`public/sql-wasm.wasm`**; `next.config.ts` con `webpack.resolve.fallback` (`fs`, `path`, `crypto`) para bundle cliente.
- Esquema: `src/lib/local-db/schema-sql.ts`; motor `sqlite-engine.ts`; servicio `database-service.ts` (`upsertDocument`, `getDocumentJson`, `insertMatchEvent`, `insertIncident`); outbox `outbox-sync.ts` + `LocalDataBootstrap` en `src/app/layout.tsx`.
- Migración one-shot LS→SQLite: `migrateLegacyPromoLocalStorageOnce` (flag `synq_sqlite_migrated_from_ls_v1`).
- API **`POST /api/sync/outbox`** → tabla **`sandbox_device_snapshots`** (migración SQL + tipos en `supabase.ts` + política insert `anon` para preview sin service role).
- **Sandbox promo** escribe/lee vault y team vía `database-service` en: `team`, `matches`, `tasks`, `sessions`, `stats`, `board/match` (guardar marcador), `board/promo` (guardar ejercicio). Mantiene `synq_promo_*` en LS para compatibilidad con pizarra y otros listeners.
- **Tutor:** `upsertDocument("tutor", "session", "current", { email })` en login/onboarding (no se suben contraseñas al outbox).
- **Continuidad:** `insertIncident("continuity", ...)` al pulsar incidencia (además de `synqSync` y API club si aplica).

### Archivos nuevos / tocados (principal)

- Nuevos: `src/lib/local-db/*`, `src/app/api/sync/outbox/route.ts`, `src/components/local-data/LocalDataBootstrap.tsx`, `supabase/migrations/20260411180000_sandbox_device_snapshots.sql`, `public/sql-wasm.wasm`.
- Modificados: `package.json`, `next.config.ts`, `src/app/layout.tsx`, `src/lib/supabase.ts`, páginas promo y board citadas arriba, `mobile-continuity`, `tutor` login/onboarding, `docs/DELIVERABLES_ROADMAP.md`.

### GUÍA DE TEST

1. **Aplicar migración** en Supabase: `sandbox_device_snapshots` (producción/preview según entorno).
2. Abrir `/sandbox/app/team`, editar y guardar: en DevTools → Application → Local Storage debe seguir existiendo `synq_promo_team`; en la misma pestaña, clave `synq_sqlite_db_v1` (array JSON) debe crecer tras guardar si WASM carga.
3. Red: al estar online, Network debe mostrar `POST /api/sync/outbox` tras guardados (si Supabase configurado). Respuesta `ok: true` y filas nuevas en `sandbox_device_snapshots`.
4. Offline: desconectar red, guardar partido en promo matches; reconectar; debe dispararse flush y vaciar cola (o `synq_outbox_fallback_queue` si WASM no disponible).
5. `npm run build` debe completar (verificado con fallback webpack).

### Bloqueos / deuda

- **`tsc --noEmit`** sigue fallando por errores **previos** en torneos (`qrcode` types, registration page); el proyecto usa `ignoreBuildErrors` en Next.
- Outbox hoy **ingesta** en `sandbox_device_snapshots` (telemetría/backup); no reemplaza aún inserciones en `operativa_mobile_incidents` sin Bearer de club.
- Credenciales Tutor **solo** en `localStorage`; no se replican a SQLite por política de seguridad en este paso (solo sesión email en documento `session/current` si hay DB).
