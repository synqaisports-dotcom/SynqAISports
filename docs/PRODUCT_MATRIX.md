# Matriz maestra de productos (SynqAI Sports)

Fuente de verdad para planificación **web + PWA + APK**. Exportable a Excel desde [`product-matrix.csv`](./product-matrix.csv) (separador `;`, UTF-8).

**Última actualización:** inventario según `src/app` y manifests declarados en layouts.

## Columnas

| Columna | Significado |
|--------|-------------|
| Producto lógico | Agrupa rutas con misma misión de negocio |
| URL base | Entrada o prefijo principal |
| Login | Comportamiento efectivo (middleware + layout) |
| Estado de datos | Dónde vive la verdad operativa |
| Manifest PWA | Ruta del manifest si existe |
| Iframe / embed | Si depende de embebidos críticos |
| Prioridad | P0 crítico negocio / primer envase nativo; P1 siguiente; P2 deuda |
| Acción | Decisión técnica recomendada |

## Prioridad P0 (orden sugerido de ejecución)

1. APIs `/api/*` estables para clientes web y futuras apps.
2. Store `/store` + entradas Sandbox `/sandbox-portal`, `/sandbox/login`.
3. Sandbox logueado `/sandbox/app/*` + pizarra `/board/*` (misma pieza táctica).
4. Dashboard club `/dashboard/*` (operativa).
5. Admin global `/admin-global/*` (solo rol admin).
6. Promo compartido `/dashboard/promo/*` ↔ `/sandbox/app/*` (refactor cuando toque, sin romper).

## Notas

- **`/sandbox/*` (demo)** y **`/dashboard/superadmin/*`**: candidatos a redirección o fusión para reducir confusión operativa.
- **Tutor**: flujo de auth propio hoy; alinear con Supabase Auth es trabajo P1 de plataforma, no cosmético.
