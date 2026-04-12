# Roadmap y entregables — SynqAI Sports

Plan maestro en cuatro fases. Los estados se actualizan en este documento conforme avanza el trabajo en repo.

| Fase | Nombre | Estado | Criterio de aceptación |
|------|--------|--------|-------------------------|
| **1** | Limpieza y clasificación | **Completado** | Política central de AdSense (`ads-policy` + `useAdsAllowed`); componentes promo compartidos en `src/components/shared`; layouts WEB-ONLY sin scripts de anuncios añadidos; duplicación del panel de home Sandbox eliminada (usa `PromoAdsPanel`); documentación `PLAN_MAESTRO`, READMEs de segmentos, `REPORT_LOG`. |
| **2** | Documentación de arquitectura | Pendiente | Manuales técnicos: diagrama de datos, flujos auth, límites web vs nativo, convenciones de rutas; actualización de `docs/apps/*` alineada al plan. |
| **3** | Infraestructura offline-first | **En proceso** | SQLite en cliente (`sql.js` + `public/sql-wasm.wasm`); tablas `documents`, `match_events`, `incidents`, `sync_outbox`; `database-service` + migración lectura/escritura Sandbox promo (equipo, vault, pizarra match/promo, tareas, sesiones, stats); Tutor: documento `session/current` (sin credenciales); Continuidad: `insertIncident` en SQLite antes de red. |
| **4** | Motor de sincronización | **En proceso** | Cola `sync_outbox`; `enqueueOutbox` por cada `upsertDocument` / incidente; `flushOutbox` en `online` + `visibilitychange`; API `POST /api/sync/outbox` → `sandbox_device_snapshots` (Supabase); fallback cola en `localStorage` si WASM falla. Pendiente: backoff exponencial fino, reintentos por job, y mapeo directo a tablas operativas con auth. |

## Notas de gobernanza

- **WEB-ONLY / VISUALIZADORES**: no cargar `adsbygoogle.js` ni slots AdSense en web (ver `src/lib/ads-policy.ts`).
- **NATIVO-CANDIDATE**: monetización prevista con **AdMob** en APK; en web solo rutas explícitamente permitidas en política.

## Historial de estado

| Fecha | Fase | Cambio |
|-------|------|--------|
| 2026-04-11 | 1 | Completado: blindaje ads, shared UI, docs base. |
| 2026-04-11 | 3–4 | En proceso: SQLite + outbox + API snapshots + bootstrap global. |
