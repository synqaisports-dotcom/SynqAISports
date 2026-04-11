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

- Ninguno para Fase 1. **SQLite en navegador** (Fases 3–4) requerirá elección concreta (sql.js, wa-sqlite, Capacitor SQLite, etc.) y no se ha implementado en este bloque.
