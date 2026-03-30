# Bitácora de trabajo híbrido (Supabase + localStorage)

Este documento registra, en orden, todo lo que vamos haciendo en cada petición de trabajo.

---

## Contexto operativo actual

- Modo de trabajo: **híbrido** (persistencia en Supabase y soporte local en `localStorage` para iterar y validar UI).
- Objetivo de producto inmediato:
  - El **administrador del club** completa onboarding.
  - Accede a `dashboard` y `methodology`.
  - Construye su club en la app.
  - Asigna qué puede hacer cada usuario del club según permisos/roles.
- Estado general:
  - Gran parte del nodo está en modo mock para acelerar construcción.
  - Conexiones reales ya existen en algunas áreas (ej. partes de metodología y admin-global).

---

## Registro por petición

### [2026-03-26] Petición #1

**Solicitud del usuario**
- Aclarar que el flujo es híbrido.
- Priorizar que el admin de club, tras onboarding, pueda operar en dashboard/metodología.
- Permitir asignación de permisos por usuarios del club.
- Crear un documento nuevo para registrar todo el trabajo a partir de ahora.

**Acciones realizadas**
- Se crea este archivo `BITACORA_TRABAJO_HIBRIDO.md`.
- Se documenta el marco de trabajo y objetivos funcionales del nodo club.

**Resultado**
- Bitácora inicial creada y lista para ir actualizándola en cada petición.

**Siguiente foco propuesto**
- Implementar el flujo real de gestión de usuarios/permisos del club en modo híbrido:
  - lectura/escritura de matriz de permisos por club,
  - alta/edición de usuarios del club,
  - guardado dual (Supabase + fallback local),
  - validación de acceso por rol en dashboard/metodología.

### [2026-03-26] Petición #2

**Solicitud del usuario**
- Revisar la “idea” que pegaste (bloque de `Qué está implementado en producto` + `Checklist operativo`) y verificar que coincide con lo que hay implementado en el repo.

**Acciones realizadas**
- Validación de consistencia técnica en el repo:
  - Migración promo: `supabase/migrations/20260324120000_promo_campaigns.sql`.
  - Tracking: endpoint `src/app/api/promo/track/route.ts` (`POST`) llama a `record_promo_scan`.
  - Admin promos: `src/app/admin-global/promos/page.tsx` lista/genera/guarda en `promo_campaigns`.
  - IA generador: `src/ai/flows/generate-promo-campaign.ts` incluye plataformas tipo Reels/TikTok/Shorts.
  - Login con token: `src/app/login/page.tsx` dispara el tracking con anti doble disparo.

**Resultado**
- El bloque pegado es coherente con lo que existe en el repo y además ya estaba reflejado en `PENDIENTES_TU_LADO.md`.

**Siguiente paso propuesto**
- Pasar a un análisis técnico del cuelgue en “Dashboard club” cuando se crean permisos/usuarios (posible fallo de RLS / persistencia híbrida / flujo de onboarding).

### [2026-03-26] Petición #3

**Solicitud del usuario**
- Revisar si “hicimos todo eso” de migraciones en el nodo de administración y metodología en todas sus secciones.

**Acciones realizadas**
- Confirmé migraciones existentes en `supabase/migrations` para:
  - Roles + RLS (`20250324190000_synq_roles_profile_roles_rls.sql`).
  - Promo/Tracking (`20260324120000_promo_campaigns.sql`).
  - Operativa de sesiones (planner + cambio + asistencia) (`20260326130000_operativa_sessions_core.sql`), incluyendo políticas RLS por `auth_club_id()` o `superadmin`.
  - Biblioteca metodología (`20260325120000_methodology_library_tasks.sql`), incluyendo política RLS por `auth_club_id()` o `superadmin`.
- Verifiqué la conexión desde el frontend:
  - `admin-global/*` llama a `/api/admin/*` (service role) en vez de escribir directo desde el navegador.
  - `dashboard/methodology/exercise-library` llama a `/api/club/methodology-library` y sus endpoints están protegidos por `verifyClubSessionFromRequest`.
  - `dashboard/methodology/session-planner` y `dashboard/methodology/calendar` usan `useOperativaSync`, que lee/escribe en Supabase (tablas `methodology_session_assignments`, `methodology_change_requests`, `methodology_session_attendance`).
  - `dashboard/methodology/academy` y `dashboard/methodology/warehouse` siguen usando `localStorage` como fuente principal (híbrido/mock).

**Resultado**
- Administración y “core metodología” (planner/calendar + biblioteca) están migradas y conectadas a Supabase.
- No todo “Methodology” es Supabase todavía: `warehouse` está en localStorage/mock en el estado actual del repo.

### [2026-03-26] Petición #4

**Solicitud del usuario**
- “Incluye todo lo de metodología para dejar esa sección cerrada con la migración híbrida”.

**Estado actual antes de implementar**
- `session-planner` y `calendar` ya sincronizan en Supabase vía `useOperativaSync` (tablas operativas + RLS).
- `exercise-library` (Biblioteca de ejercicios) ya sincroniza vía `/api/club/methodology-library/*`.
- Pendientes para “cerrar metodología” en sentido estricto:
  - `academy/cantera` (estructura/categorías y equipos) sigue en `localStorage`.
  - `warehouse` (Almacén club) sigue en `localStorage`.
  - (A revisar según alcance) `dashboard/sessions/page.tsx` también usa prefijos de `localStorage` para equipos/academy/planner.

### [2026-03-26] Petición #5

**Solicitud del usuario**
- “Incluye todo lo de metodología para dejar esa sección cerrada con la migración híbrida”.

**Acciones realizadas**
- Añadidas migraciones + RLS (JSONB por club):
  - `supabase/migrations/20260326190000_methodology_academy_state.sql`
  - `supabase/migrations/20260326190500_methodology_warehouse_state.sql`
- Actualizado tipado `src/lib/supabase.ts` para reconocer las nuevas tablas.
- Añadidos endpoints con gate de sesión de club:
  - `src/app/api/club/methodology-academy/route.ts` (GET/PUT)
  - `src/app/api/club/methodology-warehouse/route.ts` (GET/PUT)
  - Ajuste de defaults en GET (si `payload` vacío `{}` devuelve `[]` o `{state,teams}` como corresponde).
- Actualizados frontend para usar Supabase cuando `clubId` es UUID y hay `session.access_token`:
  - `src/app/dashboard/academy/page.tsx` (load desde API + sync con debounce; fallback local)
  - `src/app/dashboard/methodology/warehouse/page.tsx` (load remoto en init; persist remoto con debounce + fallback local)
  - `src/app/dashboard/methodology/session-planner/page.tsx` (teams derivados desde categorías remotas)
  - `src/app/dashboard/sessions/page.tsx` (warehouse teams + academy categories remotos; fallback local)

**Resultado**
- Metodología ya está “cerrada” en el sentido de que `academy`, `warehouse`, `session-planner` y la vista `sessions` pueden persistir y leer desde Supabase (híbrido con fallback local).

### [2026-03-26] Petición #6

**Solicitud del usuario**
- Empezar con `Dashboard club` (no modo pruebas) para analizar qué está OK con migración híbrida y revisar cada sección de forma secuencial.

**Estado de análisis (inmediato)**
- Revisado acceso/redirect en `src/app/dashboard/layout.tsx`:
  - si rol es `club_admin|coach|promo_coach` y `!profile.clubCreated`, redirige a `/dashboard/coach/onboarding`.
- Revisado consumo real en `src/app/dashboard/*`:
  - solo un conjunto de pantallas ya usa Supabase vía `/api/club/*` (metodología).
  - el resto sigue usando `localStorage` (mock/híbrido) por ahora.

**Siguiente paso**
- Validar el “híbrido real” del nodo club:
  - comprobar si `profiles.club_id` está en formato compatible con RLS (`uuid` esperado en funciones/policies).
  - localizar y ajustar (si hace falta) onboarding/alta para que `clubId` encaje con el esquema.

### [2026-03-26] Petición #7

**Solicitud del usuario**
- Confirmar y corregir el estándar UUID para `clubs.id` y `profiles.club_id`.

**Acciones realizadas**
- Ajustado el onboarding para que genere `generatedClubId` como UUID real:
  - `src/app/dashboard/coach/onboarding/page.tsx`
  - usando `crypto.randomUUID()` (fallback si no existe).

**Resultado**
- El `clubId` persistido al completar onboarding debería encajar con las policies RLS basadas en `uuid`.

**Siguiente paso**
- Empezar el análisis secuencial de `Dashboard club` empezando por la sección donde el club crea/gestiona permisos/usuarios y comprobar que ya no falla por incompatibilidad de `club_id`.

### [2026-03-26] Petición #8

**Solicitud del usuario**
- Cuando un administrador del club entre (primera vez o posteriores), gestionar qué ve y quién puede verlo mediante configuración de permisos por roles (tipo “Admin & Permisos”), conectándolo a la lógica real del club.

**Acciones realizadas**
- Persistir la matriz de permisos del club en Supabase:
  - Migración `supabase/migrations/20260326201000_club_staff_access_matrix.sql`
  - Endpoint `GET/PUT` en `src/app/api/club/staff-access-matrix/route.ts`
- Actualizar UI:
  - `src/app/dashboard/admin/page.tsx` ahora carga/guarda la matriz desde Supabase (fallback local).
  - `src/app/dashboard/staff/page.tsx` ahora intenta cargar la matriz desde Supabase (fallback local) para decidir qué puede crear/ver el usuario según rol jerárquico.

**Resultado**
- La configuración de “qué puede ver quién” ya no es solo localStorage: queda persistida por club (si el esquema UUID/RLS está correcto).

### [2026-03-26] Petición #9

**Solicitud del usuario**
- Conectar “Admin & Permisos” y la lógica de “Staff” a una configuración real por club para “qué ve quién”, usando la misma lógica de roles.

**Acciones realizadas**
- Añadida migración y RLS para matriz persistida:
  - `supabase/migrations/20260326201000_club_staff_access_matrix.sql`
  - ajustes RLS:
    - `20260326201500_club_staff_access_matrix_rls_fix.sql` (SELECT para roles de staff del club)
    - `20260326203000_club_staff_access_matrix_write_fix.sql` (WRITE para `club_admin` y `academy_director`)
- Añadido endpoint:
  - `src/app/api/club/staff-access-matrix/route.ts`
- Actualizadas pantallas:
  - `src/app/dashboard/admin/page.tsx` para cargar/guardar la matriz desde Supabase (fallback local)
  - `src/app/dashboard/staff/page.tsx` para cargar la matriz desde Supabase (fallback local)

**Resultado**
- Un club puede persistir su configuración “ver/crear” por roles, y esa config será consumida por la sección Staff para decidir qué asignar.

### [2026-03-26] Petición #10

**Solicitud del usuario**
- Registrar en bitácora la lectura de `ARCHITECTURE_LEDGER.md` y `README.md`, y fijar como premisa de trabajo que **todo lo que analicemos del producto que aún no tenga modo híbrido (Supabase + fallback local) debe crearse/implementarse**.

**Lectura resumida (referencia interna)**
- **Ledger (v72)**: modelo en dos capas — `/board/*` como captación con `localStorage`; operativa de club Pro en **Supabase** (auth, multiusuario, datos centralizados).
- **README (Blueprint v10)**: Next.js 15, Supabase Auth/BD, micro-apps por rol (`admin-global`, `dashboard`, `board`), `localStorage` como capa freemium donde aplique.

**Acciones realizadas**
- Añadida esta entrada en la bitácora.

**Premisa acordada**
- En revisiones de **Dashboard club** (y en general operativa de club), si una pantalla o dato **solo** está en mock/local y no sigue el patrón híbrido, **hay que implementarlo** (API + persistencia acorde + fallback local cuando tenga sentido).

**Revisión Admin & Permisos (`/dashboard/admin`)**
- Comprobación de controles: la matriz **Staff** (checkboxes ver/crear perfiles) y **Guardar Cambios Matriz** ya persistían la `StaffAccessMatrix` (local + Supabase si aplica).
- Hallazgo: los toggles por módulo (Acceder / Ver / Editar / Borrar) vivían solo en estado local del subcomponente y **no** formaban parte del payload guardado.
- Corrección aplicada en código: estado de permisos por módulo elevado a la matriz por rol (`modules` en cada regla), mismo guardado híbrido que el resto de la matriz.

**Resultado**
- Bitácora actualizada con premisa y revisión; pantalla Admin & Permisos con toggles de módulos alineados con persistencia.

### [2026-03-26] Petición #11

**Solicitud del usuario**
- Plan para hacer realidad la aplicación de la matriz de permisos (ocultar navegación, bloquear rutas, alinear con modelo enterprise por roles).

**Acciones realizadas**
- Creado `PLAN_ENFORCEMENT_MATRIZ_PERMISOS.md` con fases 0–7: mapa rutas↔módulos, hook/caché, sidebar, guards, niveles view/edit/delete, refuerzo opcional en API, alineación con Staff, QA y orden recomendado.

**Resultado**
- Plan ejecutable listo para implementación incremental sin sustituir RLS de Supabase.

### [2026-03-26] Petición #12

**Solicitud del usuario**
- Ejecutar el plan de enforcement de la matriz (fases del documento) y añadir **cuadro de mando** configurable desde **admin-global** y **dashboard club**; actualizar bitácora y `PLAN_ENFORCEMENT_MATRIZ_PERMISOS.md`.

**Acciones realizadas**
- **Fase 0–1**: `src/lib/club-permissions.ts` (mapa ruta→módulo, normalización, bypass); contexto `src/contexts/club-access-matrix-context.tsx`; proveedores en `src/app/dashboard/layout.tsx` y `src/app/admin-global/layout.tsx`.
- **Fase 2–3**: `src/components/dashboard/Sidebar.tsx` (`moduleId` + filtro por `access`); `src/components/dashboard/ClubRouteGuard.tsx` aplicado al contenido del dashboard.
- **Fase 6 / DRY**: `src/app/dashboard/admin/page.tsx` usa la librería compartida y `refetch` del contexto tras guardar; `src/app/dashboard/staff/page.tsx` deriva reglas desde el contexto (corregido formulario duplicado `role` en alta).
- **Cuadro de mando**: `src/components/admin/AccessMatrixCuadroMando.tsx`; `src/app/dashboard/access-matrix/page.tsx`; `src/app/admin-global/club-access-matrix/page.tsx` (selector de club, edición rápida Acceder, guardado); API `src/app/api/admin/club-staff-access-matrix/route.ts`.
- **Documentación**: actualizado `PLAN_ENFORCEMENT_MATRIZ_PERMISOS.md` con tabla de estado; esta entrada en bitácora.

**Pendiente explícito**
- Fase 4: aplicar `edit`/`delete` en acciones dentro de cada pantalla.
- Fase 5: refuerzo en APIs `/api/club/*` donde el riesgo lo justifique.

**Resultado**
- La matriz condiciona menú y rutas del dashboard (salvo bypass `superadmin`/`club_admin` y usuarios free/promo según lógica existente); superadmin puede editar la matriz de cualquier club desde admin-global.

### [2026-03-26] Petición #13

**Solicitud del usuario**
- Continuar el plan de enforcement e incluir **metodología** dentro del alcance del plan (no solo validación de ruta/menú, sino **niveles edición/borrado** en las pantallas del nodo).

**Acciones realizadas**
- Hook `src/hooks/use-club-module-permissions.ts` para `canView` / `canEdit` / `canDelete` por `ClubModuleId` con la misma matriz que el contexto global.
- `src/app/dashboard/methodology/page.tsx`: cliente; filtro de tarjetas por `access` al módulo de cada ruta; tarjeta **Almacén (Club)** hacia `warehouse`.
- `exercise-library`: permisos módulo `exercises` (y roles elevados) en guardas y botones.
- `warehouse`: permisos módulo `planner` en altas/bajas de materiales e instalaciones.
- `session-planner`: permisos módulo `planner` en guardar protocolo, sincronización, asistencia, finalizar registro, sugerencias/aprobaciones director (`SessionBlock` con `matrixCanEdit` / `matrixCanDelete`), e incluso **APROBAR/RECHAZAR** solicitudes de cambio deshabilitados sin `edit`.
- Actualizado `PLAN_ENFORCEMENT_MATRIZ_PERMISOS.md`: Fase 4 en estado **parcial** con bloque explícito de metodología y riesgos ajustados.

**Pendiente explícito**
- Extender Fase 4 al resto de secciones del dashboard (club, staff, academy, …) con el mismo patrón.
- Fase 5 en APIs `/api/club/*` donde el riesgo lo justifique.

**Resultado**
- Metodología queda **dentro del plan documentado** y aplicada en UI: hub, biblioteca, almacén y planificador respetan `edit`/`delete` (y `access` en el hub) además de guards y sidebar previos.

### [2026-03-26] Petición #14

**Solicitud del usuario**
- Cerrar el plan de enforcement: resto del dashboard y refuerzo en API.

**Acciones realizadas**
- **Fase 4 (UI)**: permisos por módulo en `club`, `staff` (alta/edición/borrado + matriz jerárquica existente), `academy` (incl. sync remoto solo si `edit`), `players`, `instalaciones`, `sessions` (asistencia y sugerencias condicionadas a `planner`/edición).
- **Fase 5**: `src/lib/club-matrix-api-guard.ts` y uso en `methodology-library`, `methodology-library/[id]`, `methodology-warehouse`, `methodology-academy`, `PUT staff-access-matrix`.
- **Documentación**: `PLAN_ENFORCEMENT_MATRIZ_PERMISOS.md` actualizado (fases 4–5 en estado cerrado para el alcance actual).

**Resultado**
- Las pantallas principales del dashboard club y las APIs club existentes alinean UI + servidor con la matriz (sin sustituir RLS).


