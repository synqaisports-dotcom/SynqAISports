# Backoffice Pro (Admin global)

## Propósito

Centro de mando para **superadministración**: clubs, usuarios globales, roles, salud del sistema, analíticas (incl. funnel Sandbox Coach), planes, promos, ejercicios, matriz de acceso y colaboración. Requiere identidad con permisos elevados.

## Catálogo Store

- **Slug:** `backoffice`
- **Href:** `/admin-global`
- **accessMode:** `login_required`

## Rutas principales

| Ruta | Función (según módulos actuales) |
|------|-----------------------------------|
| `/admin-global` | Dashboard / entrada analítica |
| `/admin-global/analytics` | Métricas agregadas (incl. eventos ads / sandbox coach) |
| `/admin-global/health` | System health (Supabase, tablas, env) |
| `/admin-global/clubs` | Gestión de clubs |
| `/admin-global/users` | Usuarios / membresías / roles |
| `/admin-global/roles` | Roles |
| `/admin-global/plans` | Planes |
| `/admin-global/promos` | Promos |
| `/admin-global/exercises` | Ejercicios |
| `/admin-global/collaboration` | Colaboración |
| `/admin-global/club-access-matrix` | Matriz de acceso |

## Autenticación y permisos

- Login Supabase obligatorio.
- Gate de superadmin en layout/APIs (no usar rutas sin verificar rol en código).

## Datos

- Lectura/escritura vía **APIs route handlers** y cliente Supabase con **service role** donde corresponda (p. ej. listados globales).
- Tablas típicas: `clubs`, `profiles`, `club_memberships`, `synq_roles`, `admin_user_states`, `ad_events_queue`, etc. (ver migraciones `supabase/migrations`).

## Relación con Sandbox

- Ingesta de eventos desde cliente sandbox: `ad_events_queue`.
- Dashboard analytics puede mostrar KPIs `sandboxCoach*` (impresiones, clics, aperturas, revenue estimado por env).

## Archivos de referencia

- Entrada: `src/app/admin-global/page.tsx`
- Catálogo: `src/lib/store-catalog.ts`
- APIs admin: `src/app/api/admin/*`
