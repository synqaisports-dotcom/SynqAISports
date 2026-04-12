# Roadmap y entregables — SynqAI Sports

Plan maestro por fases (1–6+). Los estados se actualizan en este documento conforme avanza el trabajo en repo.

| Fase | Nombre | Estado | Criterio de aceptación |
|------|--------|--------|-------------------------|
| **1** | Limpieza y clasificación | **Completado** | Política central de AdSense (`ads-policy` + `useAdsAllowed`); componentes promo compartidos en `src/components/shared`; layouts WEB-ONLY sin scripts de anuncios añadidos; duplicación del panel de home Sandbox eliminada (usa `PromoAdsPanel`); documentación `PLAN_MAESTRO`, READMEs de segmentos, `REPORT_LOG`. |
| **2** | Documentación de arquitectura | **Completado** | `docs/ARCHITECTURE_OVERVIEW.md` (stack, auth, datos, flujos); `docs/I18N_AND_GLOBAL.md` (multi-idioma actual, roadmap 50+ países, checklist locales); referencias cruzadas en `PLAN_MAESTRO.md` y `docs/apps/README.md`. |
| **3** | Infraestructura offline-first | **Completado** | SQLite en cliente (`sql.js` + `public/sql-wasm.wasm`); tablas `documents`, `match_events`, `incidents`, `sync_outbox`; `database-service` + migración lectura/escritura Sandbox promo; Tutor `session/current`; Continuidad `insertIncident` local. |
| **4** | Motor de sincronización | **Completado** | Outbox con `last_attempt_at`; backoff exponencial por job; tope de reintentos y descarte; lotes de 50; flush periódico 30s + online/visibility; métricas en `localStorage` y evento `synq:outbox-metrics-updated`; fallback LS con espaciado de reintento. API `POST /api/sync/outbox` → `sandbox_device_snapshots`. Ver `docs/OUTBOX_SYNC.md`. |
| **5** | Cáscara Android (Capacitor) | **Completado** | Proyecto `android/`; `capacitor.config.ts` con `server.url` producción (`https://synqai.net`) o `CAPACITOR_SERVER_URL`; icono + splash Deep Night / Electric Cyan; `docs/CAPACITOR_ANDROID.md`. |
| **6** | Ingest operativo autenticado (continuidad → club) | **Completado** | `POST /api/sync/promote-continuity` + columna **`sync_key`** única en `operativa_mobile_incidents`; cola `synq_continuity_pending_incidents_v1`; integración en `mobile-continuity`; doc en `OUTBOX_SYNC.md`. *Extensión futura:* promover otros `op` desde outbox snapshot vía worker. |

## Notas de gobernanza

- **WEB-ONLY / VISUALIZADORES**: no cargar `adsbygoogle.js` ni slots AdSense en web (ver `src/lib/ads-policy.ts`).
- **NATIVO-CANDIDATE**: monetización prevista con **AdMob** en APK; en web solo rutas explícitamente permitidas en política.

## Historial de estado

| Fecha | Fase | Cambio |
|-------|------|--------|
| 2026-04-11 | 1 | Completado: blindaje ads, shared UI, docs base. |
| 2026-04-11 | 3 | Completado: SQLite local + promo migrado + bootstrap. |
| 2026-04-11 | 4 | Completado: outbox backoff, métricas, intervalo flush, OUTBOX_SYNC.md. |
| 2026-04-11 | 5 | Completado: Capacitor Android + assets + doc CAPACITOR_ANDROID. |
| 2026-04-12 | 6 | Creada fase: ingest operativo autenticado (outbox → tablas club). |
| 2026-04-12 | 2 | Completado: ARCHITECTURE_OVERVIEW + I18N_AND_GLOBAL. |
| 2026-04-12 | 6 | Completado: promote-continuity + sync_key + cola local. |
