# Tutor by SynqAI

## Propósito

Micro-app orientada a **familias / tutores**: portal con dashboard, calendario, estadísticas, chat e identificación; flujo de onboarding. Enfoque distinto al Sandbox (club/entrenador).

## Catálogo Store

- **Slug:** `tutor`
- **Href:** `/tutor`
- **accessMode:** `login_required`

## Rutas principales

| Ruta | Función |
|------|---------|
| `/tutor` | Entrada |
| `/tutor/dashboard` | Panel principal |
| `/tutor/calendar` | Calendario |
| `/tutor/stats` | Estadísticas |
| `/tutor/chat` | Chat |
| `/tutor/id` | Identificación / perfil tutor |
| `/tutor/onboarding` | Onboarding |

## Autenticación

- `login_required` en catálogo; el layout de tutor debe aplicar guards según política de producto (revisar `src/app/tutor/layout.tsx` y componentes cliente).

## PWA

- Manifest dedicado: `src/app/tutor/manifest.json/route.ts`

## Archivos de referencia

- Layout cliente: `src/app/tutor/tutor-client-layout.tsx`
- Páginas: `src/app/tutor/*/page.tsx`
- Catálogo: `src/lib/store-catalog.ts`

## Notas

- Detalle funcional por pantalla (APIs, tablas Supabase) conviene ampliarlo cuando se congelen requisitos de tutor.
