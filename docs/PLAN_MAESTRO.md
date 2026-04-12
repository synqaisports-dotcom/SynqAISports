# Plan maestro — Clasificación de rutas (Mapa de verdad)

Clasificación operativa para separar **plataforma web** y **ecosistema nativo** (AdMob). Fuente complementaria: `docs/product-matrix.csv`.

## Leyenda

| Clase | Significado | AdSense web |
|-------|-------------|-------------|
| **WEB-ONLY (sin ads)** | Club, admin, marketing, tutor | No |
| **VISUALIZADORES (sin ads)** | TV, kiosks, check-in | No |
| **NATIVO-CANDIDATE (AdMob)** | Sandbox, smartwatch, continuidad | Solo donde `shouldAllowAdsenseWeb()` es true |

Implementación: `src/lib/ads-policy.ts`, hook `src/hooks/use-ads-allowed.ts`, componente `PromoAdsPanel` en `src/components/shared/command-hub-ui.tsx`.

**Datos locales (Fase 3–4):** SQLite en navegador vía `sql.js` (`src/lib/local-db/`), outbox con backoff y métricas → `POST /api/sync/outbox` → `sandbox_device_snapshots`. Ver `docs/OUTBOX_SYNC.md` y `REPORT_LOG.md`.

**Fase 6 (hecho):** incidencias continuidad → **`/api/sync/promote-continuity`** + `sync_key` en `operativa_mobile_incidents`. Ver `docs/OUTBOX_SYNC.md`.

**Fase 2 (hecho):** arquitectura consolidada en `docs/ARCHITECTURE_OVERVIEW.md`; i18n / global en `docs/I18N_AND_GLOBAL.md`.

---

## WEB-ONLY (sin AdSense web)

| Prefijo / ruta | Rol |
|----------------|-----|
| `/` | Landing |
| `/apps`, `/plataforma`, `/precios`, `/contacto` | Marketing |
| `/store`, `/store/[slug]` | Galería de micro-apps |
| `/login` | Auth global |
| `/dashboard/*` | Operativa club, metodología, torneos (excepto continuidad explícita abajo) |
| `/admin-global/*` | Superadmin |
| `/tutor/*` | Familias |
| `/board/match`, `/board/training` | Pizarra club (sin monetización web en código actual) |

**Nota:** `/dashboard/promo/*` reutiliza la misma implementación que Sandbox; al estar bajo `/dashboard`, **AdSense web queda bloqueado** por política (placeholder “nativo”). Los entrenadores deben usar `/sandbox/app/*` o APK para anuncios web/AdSense según despliegue.

---

## VISUALIZADORES (sin AdSense web)

| Prefijo | Rol |
|---------|-----|
| `/live-fields` | Visualizador TV / estado de campos |
| `/tournaments/checkin` | Terminal check-in |

Otras rutas `/tournaments/*` (coach, parents, etc.): tratar como **WEB-ONLY** salvo decisión explícita de producto.

---

## NATIVO-CANDIDATE (AdMob en nativo; AdSense web solo en rutas permitidas)

| Prefijo | Rol |
|---------|-----|
| `/sandbox/*` | Sandbox Coach, portal, login, Command Hub |
| `/sandbox-portal` | Entrada con redirect |
| `/smartwatch` | Enlace reloj |
| `/dashboard/mobile-continuity` | Modo continuidad (misma política que candidato nativo en web) |
| `/sandbox/app/*` | App logueada + periféricos embebidos |
| `/board/promo` | Pizarra promo / sandbox táctica con slots |

---

## APIs (transversal)

`/api/*`: sin AdSense; gobernanza por autenticación y claves. Documentar en Fase 2.

---

## Próximos cortes técnicos

1. Unificar auth Tutor con Supabase (Fase 2+).
2. SQLite + outbox (Fases 3–4).
3. Primera APK con deep links a `/sandbox/app` (roadmap producto).
