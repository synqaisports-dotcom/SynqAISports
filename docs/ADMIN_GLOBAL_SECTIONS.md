# Admin Global — Inventario de secciones y duplicidades

Referencia para CTO: qué hace cada ruta bajo `/admin-global`, enlaces en sidebar y qué unificar o retirar.

| Ruta | En menú | Qué hace | Duplicidades / notas |
|------|---------|-----------|----------------------|
| `/admin-global` | Dashboard | KPIs desde `/api/admin/analytics` (cache local + red); accesos rápidos. | Métricas “trend” en tarjetas pueden ser estáticas; alinear con series reales si se desea. |
| `/admin-global/clubs` | Gestión Clubes | CRUD clubes vía API: listado Supabase, crear/editar sheet, pausar/activar, **eliminar** (DELETE + confirmación). Fallback `localStorage` si no hay sesión/API. | Matriz por club está en **Cuadro Matriz Club** (no duplicar lógica aquí). |
| `/admin-global/plans` | Gestión Planes | Planes comerciales (local + POST/PATCH/DELETE API). Matriz de “sectores” en diálogo = **catálogo conceptual**, no aplica permisos runtime (ver `club-permissions`). | Unificar naming con producto o enlazar doc; no confundir con matriz real del club. |
| `/admin-global/roles` | Gestión Roles | Catálogo `synq_roles`, conteos `/api/admin/roles-summary`, CRUD roles custom. Sheet “matriz” = **solo documentación UI**. | Flujo real: Roles → catálogo; **Usuarios** → `profiles.role`. Evitar tercer sitio para lo mismo. |
| `/admin-global/users` | Gen. Usuarios | Alta/edición usuarios, roles, club; sync API + audit logs. | Duplicidad resuelta: un solo selector de club. |
| `/admin-global/health` | System Health | Checks técnicos (`/api/admin/health`). | No mezclar operaciones de negocio. |
| `/admin-global/analytics` | Analytics Global | KPIs, Recharts estilo Command Hub, mapas calor + OSM, cola ads, geo perfiles, promos top. | Enlaces a Promos y Colaboración; evitar copiar tablas completas de Promos aquí. |
| `/admin-global/promos` | Campañas & QR | Lista `promo_campaigns`, IA para copy, QR, magic links. | Vista analítica agregada en **Analytics**; esta página es **operativa**. |
| `/admin-global/collaboration` | Colaboración | Leads/feedback `sandbox_collaboration_submissions`. | Enlazado desde Analytics; antes no estaba en sidebar (solo URL directa). |
| `/admin-global/exercises` | Almacén neural | Inventario/export ejercicios (neural warehouse, promo vault, etc.). | Solapa con **warehouse** del dashboard club en propósito; aquí es **vista superadmin global**. |
| `/admin-global/club-access-matrix` | Cuadro Matriz Club | Matriz staff por club (`club_staff_access_matrix` API). | Misma política que Admin & Permisos del club; mantener una sola fuente de verdad en `club-permissions`. |

## Recomendaciones de limpieza (sin implementar aquí)

1. **Planes.access**: o bien se implementa en guards, o se renombra en UI a “pack comercial” para no chocar con matriz club.
2. **Roles sheet**: acortar o sustituir por enlace a esta doc + Cuadro matriz.
3. **Dashboard home**: revisar textos de tendencia si deben ser 100 % datos vivos.
