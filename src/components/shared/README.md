# `src/components/shared`

UI y utilidades **reutilizadas** entre segmentos del App Router (p. ej. Sandbox y `dashboard/promo`).

| Archivo | Propósito |
|---------|-----------|
| `command-hub-ui.tsx` | Paneles Command Hub (`HubPanel`, `SectionBar`, estilos) y `PromoAdsPanel` con política `useAdsAllowed()`. |

**Regla:** no importar desde `app/dashboard/promo` en código nuevo; usar `@/components/shared/command-hub-ui`.
