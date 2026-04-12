# Roadmap y entregables — SynqAI Sports

Plan maestro por fases (1–6+). Los estados se actualizan en este documento conforme avanza el trabajo en repo.

| Fase | Nombre | Estado | Criterio de aceptación |
|------|--------|--------|-------------------------|
| **1** | Limpieza y clasificación | **Completado** | Política central de AdSense (`ads-policy` + `useAdsAllowed`); componentes promo compartidos en `src/components/shared`; layouts WEB-ONLY sin scripts de anuncios añadidos; duplicación del panel de home Sandbox eliminada (usa `PromoAdsPanel`); documentación `PLAN_MAESTRO`, READMEs de segmentos, `REPORT_LOG`. |
| **2** | Documentación de arquitectura | Pendiente | Manuales técnicos: diagrama de datos, flujos auth, límites web vs nativo, convenciones de rutas; actualización de `docs/apps/*` alineada al plan. |
| **3** | Infraestructura offline-first | **Completado** | SQLite en cliente (`sql.js` + `public/sql-wasm.wasm`); tablas `documents`, `match_events`, `incidents`, `sync_outbox`; `database-service` + migración lectura/escritura Sandbox promo; Tutor `session/current`; Continuidad `insertIncident` local. |
| **4** | Motor de sincronización | **Completado** | Outbox con `last_attempt_at`; backoff exponencial por job; tope de reintentos y descarte; lotes de 50; flush periódico 30s + online/visibility; métricas en `localStorage` y evento `synq:outbox-metrics-updated`; fallback LS con espaciado de reintento. API `POST /api/sync/outbox` → `sandbox_device_snapshots`. Ver `docs/OUTBOX_SYNC.md`. |
| **5** | Cáscara Android (Capacitor) | **Completado** | Proyecto `android/`; `capacitor.config.ts` con `server.url` producción (`https://synqai.net`) o `CAPACITOR_SERVER_URL`; icono + splash Deep Night / Electric Cyan; `docs/CAPACITOR_ANDROID.md`. |
| **6** | Ingest operativo autenticado (outbox → club) | Pendiente | Tras la cola anónima/telemetría (`sandbox_device_snapshots`), exponer **API con Bearer** que materialice jobs en tablas operativas: p. ej. `op: incident` / `continuity` → `operativa_mobile_incidents` con `club_id` validado contra `verifyClubSessionFromRequest` y RLS existente. **Idempotencia** por `outbox_job_id` o hash en payload para no duplicar filas. **Documentar** en `docs/OUTBOX_SYNC.md` (flujo dual: snapshot vs operativo). Opcional: job/worker server-side que lea snapshots y promueva a operativa solo con `service_role` + reglas estrictas. |

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
