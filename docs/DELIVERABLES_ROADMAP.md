# Roadmap y entregables — SynqAI Sports

Plan maestro en cuatro fases. Los estados se actualizan en este documento conforme avanza el trabajo en repo.

| Fase | Nombre | Estado | Criterio de aceptación |
|------|--------|--------|-------------------------|
| **1** | Limpieza y clasificación | **Completado** | Política central de AdSense (`ads-policy` + `useAdsAllowed`); componentes promo compartidos en `src/components/shared`; layouts WEB-ONLY sin scripts de anuncios añadidos; duplicación del panel de home Sandbox eliminada (usa `PromoAdsPanel`); documentación `PLAN_MAESTRO`, READMEs de segmentos, `REPORT_LOG`. |
| **2** | Documentación de arquitectura | Pendiente | Manuales técnicos: diagrama de datos, flujos auth, límites web vs nativo, convenciones de rutas; actualización de `docs/apps/*` alineada al plan. |
| **3** | Infraestructura offline-first | Pendiente | SQLite (o capa equivalente en cliente) con esquema Sandbox: eventos de partido e incidencias; guardado inmediato sin depender de Supabase en campo; tests manuales documentados. |
| **4** | Motor de sincronización | Pendiente | Outbox `pending_sync`; lotes enviados al recuperar red (`navigator.onLine` + backoff); APIs Supabase acordadas; métricas de fallo en cola. |

## Notas de gobernanza

- **WEB-ONLY / VISUALIZADORES**: no cargar `adsbygoogle.js` ni slots AdSense en web (ver `src/lib/ads-policy.ts`).
- **NATIVO-CANDIDATE**: monetización prevista con **AdMob** en APK; en web solo rutas explícitamente permitidas en política.

## Historial de estado

| Fecha | Fase | Cambio |
|-------|------|--------|
| 2026-04-11 | 1 | Completado: blindaje ads, shared UI, docs base. |
