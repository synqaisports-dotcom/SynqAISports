# `/admin-global` — Superadmin

**Clase:** WEB-ONLY (sin publicidad web). Gestión global: clubs, usuarios, roles, planes, salud, analytics.

Guard de rol en layout cliente; middleware marca ruta como protegida.

## Alineación técnica (CTO)

- **UI Radix:** `Dialog` usa `z-[280]/z-[290]` para no quedar bajo `Sheet` (`z-[210]`). `Select` usa `z-[300]` en el componente base.
- **Planes → Matriz de sectores:** el diálogo es scrollable (`max-h-[85vh]`) y textos secundarios con contraste legible.
- **Analytics:** gráficas Recharts alineadas con Command Hub Sandbox (área + barras). **Plano mundial Sandbox** = agregación desde `sandbox_device_snapshots` con `op: sandbox_telemetry` (beacon en `/sandbox/app`, país desde `synq_promo_team.country`). **Mapa mundial** = teselas OpenStreetMap + capa de calor (`WorldHeatMap`).
- **Promos** (`/admin-global/promos`): activo en sidebar como **Campañas & QR**; enlaza a Analytics para vista ejecutiva.
- **Inventario completo** de secciones, duplicidades y sidebar: `docs/ADMIN_GLOBAL_SECTIONS.md`.
- **Borrar club:** en Gestión Clubes, acción papelera con confirmación; API `DELETE /api/admin/clubs` (puede fallar si hay FKs en Supabase).
- **Qué retirar o unificar después (opciones):** duplicar matriz “sectores” de planes con `club-permissions` real; roles página “matriz” solo referencia vs `synq_roles` + usuarios; métricas demo en dashboard home si se sustituyen por series reales de API.
