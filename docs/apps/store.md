# Store — Galería de micro-apps

## Propósito

Superficie pública tipo “hub de productos” donde cada micro-app tiene URL propia, descripción y modo de acceso declarado (`open`, `optional_login`, `login_required`).

## Rutas principales

| Ruta | Descripción |
|------|-------------|
| `/store` | Listado / galería de aplicaciones |
| `/store/[slug]` | Ficha de producto (según `STORE_PRODUCTS`) |

## Implementación

- Catálogo central: `src/lib/store-catalog.ts`
- Páginas: `src/app/store/page.tsx`, `src/app/store/[slug]/page.tsx`

## Relación con otras apps

Los `href` del catálogo enlazan a la entrada real de cada micro-app (p. ej. Sandbox → `/sandbox-portal?dest=/sandbox/app`).

## Notas

- El modo de acceso del catálogo es **declarativo**; la ruta destino puede imponer login adicional en su propio layout (revisar el `.md` de cada app).
