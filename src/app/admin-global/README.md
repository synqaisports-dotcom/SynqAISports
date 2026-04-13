# `/admin-global` — Superadmin

**Clase:** WEB-ONLY (sin publicidad web). Gestión global: clubs, usuarios, roles, planes, salud, analytics.

Guard de rol en layout cliente; middleware marca ruta como protegida.

## Alineación técnica (CTO)

- **UI Radix:** `Dialog` usa `z-[280]/z-[290]` para no quedar bajo `Sheet` (`z-[210]`). `Select` usa `z-[300]` en el componente base.
- **Planes → Pack comercial:** el diálogo (scrollable, `max-h-[85vh]`) nombra el catálogo comercial; la matriz real de staff por club sigue en **Cuadro Matriz Club**.
- **Analytics:** gráficas Recharts alineadas con Command Hub Sandbox (área + barras). **Plano mundial Sandbox** = agregación desde `sandbox_device_snapshots` con `op: sandbox_telemetry` (beacon en `/sandbox/app`, país desde `synq_promo_team.country`). **Mapa mundial** = teselas OpenStreetMap + capa de calor (`WorldHeatMap`).
- **Promos** (`/admin-global/promos`): activo en sidebar como **Campañas & QR**; enlaza a Analytics para vista ejecutiva.
- **Inventario completo** de secciones, duplicidades y sidebar: `docs/ADMIN_GLOBAL_SECTIONS.md`.
- **Borrar club:** en Gestión Clubes, acción papelera con confirmación; API `DELETE /api/admin/clubs` (puede fallar si hay FKs en Supabase).
- **Dashboard home:** KPIs y tendencias desde `/api/admin/analytics` (comparativa 7+7 días UTC); gráfico de señal = serie 30 días (altas de perfil + escaneos promo por día).
- **Roles:** diálogo corto “Guía de referencia” con enlaces a Usuarios, Cuadro matriz y `docs/ADMIN_GLOBAL_SECTIONS.md` (sin sheet largo que parecía editable).
