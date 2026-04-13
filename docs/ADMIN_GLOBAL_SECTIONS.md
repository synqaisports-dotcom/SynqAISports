# Admin Global — Inventario de secciones y duplicidades

Referencia para CTO: qué hace cada ruta bajo `/admin-global`, enlaces en sidebar y qué unificar o retirar.

| Ruta | En menú | Qué hace | Duplicidades / notas |
|------|---------|-----------|----------------------|
| `/admin-global` | Dashboard | KPIs desde `/api/admin/analytics` (cache local + red); tendencias comparan últimos 7 días vs 7 anteriores; gráfico “señal operativa” = serie diaria 30 días (perfiles + escaneos promo). | — |
| `/admin-global/clubs` | Gestión Clubes | CRUD clubes vía API: listado Supabase, crear/editar sheet, pausar/activar, **eliminar** (DELETE + confirmación). Fallback `localStorage` si no hay sesión/API. | Matriz por club está en **Cuadro Matriz Club** (no duplicar lógica aquí). |
| `/admin-global/plans` | Gestión Planes | Planes comerciales (local + POST/PATCH/DELETE API). Diálogo renombrado a **pack comercial** (catálogo); permisos runtime en **Cuadro Matriz Club** (`club-permissions`). | — |
| `/admin-global/roles` | Gestión Roles | Catálogo `synq_roles`, conteos `/api/admin/roles-summary`, CRUD roles custom. Diálogo corto **Guía de referencia** con enlaces a Usuarios + Cuadro matriz + `docs/ADMIN_GLOBAL_SECTIONS.md`. | Flujo real: Roles → catálogo; **Usuarios** → `profiles.role`. |
| `/admin-global/users` | Gen. Usuarios | Alta/edición usuarios, roles, club; sync API + audit logs. | Duplicidad resuelta: un solo selector de club. |
| `/admin-global/health` | System Health | Checks técnicos (`/api/admin/health`). | No mezclar operaciones de negocio. |
| `/admin-global/analytics` | Analytics Global | KPIs, Recharts estilo Command Hub, mapas calor + OSM, cola ads, geo perfiles, promos top. | Enlaces a Promos y Colaboración; evitar copiar tablas completas de Promos aquí. |
| `/admin-global/promos` | Campañas & QR | Lista `promo_campaigns`, IA para copy, QR, magic links. | Vista analítica agregada en **Analytics**; esta página es **operativa**. |
| `/admin-global/collaboration` | Colaboración | Leads/feedback `sandbox_collaboration_submissions`. | Enlazado desde Analytics; antes no estaba en sidebar (solo URL directa). |
| `/admin-global/exercises` | Almacén neural | Inventario/export ejercicios (neural warehouse, promo vault, etc.). | Solapa con **warehouse** del dashboard club en propósito; aquí es **vista superadmin global**. |
| `/admin-global/club-access-matrix` | Cuadro Matriz Club | Matriz staff por club (`club_staff_access_matrix` API). | Misma política que Admin & Permisos del club; mantener una sola fuente de verdad en `club-permissions`. |

## Limpieza aplicada (referencia)

1. **Planes.access**: UI renombrada a **pack comercial**; aclaración vs matriz club.
2. **Roles**: sheet largo sustituido por diálogo con enlaces (usuarios, cuadro matriz, doc).
3. **Dashboard home**: tendencias y gráfico de señal alimentados por series de `/api/admin/analytics` (ventana 30 días UTC).
