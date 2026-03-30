# Plan: aplicar la matriz de permisos del club en la app (navegación + rutas + API)

Objetivo: que lo configurado en **Admin & Permisos** (por rol: `modules.*.{access,view,edit,delete}` y matriz Staff) **condicione de verdad** qué ve el usuario y qué puede abrir, sin sustituir **RLS de Supabase** (capa servidor sigue siendo obligatoria).

## Estado de implementación (2026-03-26)

| Fase | Estado | Notas |
|------|--------|--------|
| 0 | **Hecho** | `src/lib/club-permissions.ts`: `CLUB_MODULE_IDS`, tipos, `resolveClubModuleForPath`, `normalizeStaffAccessMatrix`, `buildDefaultStaffAccessMatrix`, bypass `superadmin`/`club_admin`. |
| 1 | **Hecho** | `src/contexts/club-access-matrix-context.tsx` + envoltura en `dashboard/layout.tsx` y `admin-global/layout.tsx`. |
| 2 | **Hecho** | `Sidebar.tsx`: `moduleId` por ítem + `canAccessClubModule(..., "access")` si no bypass y matriz cargada. |
| 3 | **Hecho** | `ClubRouteGuard.tsx` en layout dashboard (envuelve `children`). `/dashboard/admin` y `/dashboard/access-matrix` sin prefijo en mapa → no bloquean por módulo. |
| 4 | **Hecho (dashboard club)** | `useClubModulePermissions`: metodología (hub + biblioteca + almacén + planificador), **Identidad** `club/page.tsx`, **Staff** `staff/page.tsx`, **Cantera** `academy/page.tsx`, **Jugadores** `players/page.tsx`, **Instalaciones** `instalaciones/page.tsx`, **Sesiones coach** `sessions/page.tsx` (asistencia + sugerencias ↔ `planner` edit). |
| 5 | **Hecho (APIs `/api/club/*` actuales)** | `src/lib/club-matrix-api-guard.ts`: `loadNormalizedStaffMatrixForClub` + `guardClubModuleOr403`. Aplicado a: `methodology-library` (GET `exercises`/view, POST edit), `[id]` PATCH/DELETE (edit/delete), `methodology-warehouse` (GET planner/view, PUT edit), `methodology-academy` (GET academy/view, PUT edit), `staff-access-matrix` **solo PUT** (staff/edit) — el GET de matriz sigue sin guard de módulo para no romper la carga del contexto que necesita permisos globales. |
| 6 | **Hecho** | `staff/page.tsx` consume `normalizedMatrix` del contexto (misma fuente que el guard/sidebar). |
| Cuadro de mando | **Hecho** | `src/app/dashboard/access-matrix/page.tsx` (vista); `src/app/admin-global/club-access-matrix/page.tsx` (selector club + rejilla Acceder + guardar); `src/components/admin/AccessMatrixCuadroMando.tsx`; API `src/app/api/admin/club-staff-access-matrix/route.ts`. |

**Referencias rápidas**  
- Persistencia club: `GET/PUT /api/club/staff-access-matrix` + `localStorage`.  
- Persistencia superadmin por club: `GET/PUT /api/admin/club-staff-access-matrix?clubId=` (service role en servidor).  
- Navegación global: ítem **Cuadro Matriz Club**; dashboard club: **Cuadro Matriz**.

---

## Fase 0 — Fuente única de verdad y mapa rutas ↔ módulos

**Problema**: hoy los `MODULES` del admin y los `href` del sidebar están desacoplados.

**Acción**  
1. Crear `src/lib/club-permissions.ts` (o nombre similar) con:
   - Constante **`CLUB_MODULE_IDS`** alineada con el admin (`club`, `staff`, …).
   - **`NavModuleKey`** y tabla **`ROUTE_TO_CLUB_MODULE`**: cada ruta relevante del dashboard (y subrutas de metodología que correspondan a `exercises` / `planner` / subconjunto de “board”) apunta a **un** `moduleId`.
   - Tipos TypeScript compartidos: `ModulePermState`, `StaffAccessRule`, `StaffAccessMatrix` (importables desde admin/staff/sidebar para no duplicar).

**Reglas de mapeo (propuesta inicial)**  

| Área navegación | Rutas ejemplo | `moduleId` |
|-----------------|---------------|------------|
| Identidad | `/dashboard/club` | `club` |
| Staff | `/dashboard/staff` | `staff` |
| Cantera | `/dashboard/academy` | `academy` |
| Jugadores | `/dashboard/players` | `players` |
| Instalaciones | `/dashboard/instalaciones` | `facilities` |
| Pizarras / táctico | `/board/*`, enlaces desde sidebar operativo/metodología | `board` |
| Biblioteca ejercicios | `/dashboard/methodology/exercise-library`, `/dashboard/coach/library` | `exercises` |
| Planner / sesiones | `/dashboard/sessions`, `/dashboard/coach/planner`, `/dashboard/methodology/session-planner`, `watch-config` si lo enlazas a operativa | `planner` (ajustar si preferís partir `watch` en otro módulo) |
| Admin & Permisos | `/dashboard/admin` | **Tratar especial**: solo roles ya autorizados; opcionalmente mapear a un módulo `admin` o dejar fuera de la matriz con regla fija |

**Entregable**: un solo import usado por admin (opcional, para DRY), sidebar y guards.

---

## Fase 1 — Carga de matriz en cliente (hook + caché)

**Acción**  
1. Implementar `useClubStaffAccessMatrix()` en `src/hooks/use-club-staff-access-matrix.ts`:
   - Entrada: `profile`, `session` (via `useAuth`).
   - Misma lógica que hoy: si `canUseOperativaSupabase(clubId)` + token → `GET /api/club/staff-access-matrix`; si no, `localStorage`.
   - **Normalización**: reutilizar la misma función de fusión por defectos que en admin (extraer a `club-permissions.ts` para no bifurcar comportamientos).
   - Estado: `matrix`, `loading`, `error`, `refetch`.
   - **Memo/caché**: evitar N fetch al cambiar de ruta (React context ligero opcional: `ClubAccessMatrixProvider` en `dashboard/layout.tsx`).

**Roles que omiten la matriz (siempre “full” en producto)**  
- `superadmin`: no filtrar por matriz (comportamiento actual de élite).  
- Opcional documentado: `club_admin` con política “si no hay fila en matriz, comportamiento por defecto conservador o permisivo” — **decidir una sola regla** y documentarla en código.

**Entregable**: cualquier pantalla puede llamar `canAccessRoute(path, level)` o `getRuleForRole(role)`.

---

## Fase 2 — Sidebar: ocultar enlaces según `access`

**Acción**  
1. Extender `NavItem` con **`moduleId?: string`** (opcional) para ítems `operational` y `methodology` que correspondan a módulos de club.
2. Tras el filtro actual (`roles`, `isFree`), aplicar:
   - Si `item.moduleId` existe y el usuario es **staff de club** (no superadmin): ocultar si `!rule.modules[moduleId].access` (usar regla del **rol actual** `profile.role`).
3. Mantener ítems sin `moduleId` con la lógica actual (o asignarles módulo en Fase 0 para no dejar agujeros).

**Criterio de aceptación**  
- Un rol al que se le desactiva **Acceder** en “Gestión de Staff” **no** ve el enlace Staff en el menú.  
- Idem para club, cantera, etc.

---

## Fase 3 — Guardas de ruta (deep links y URL manual)

**Problema**: ocultar el menú no basta; el usuario puede pegar la URL.

**Acción**  
1. Componente cliente `ClubRouteGuard` (`src/components/dashboard/ClubRouteGuard.tsx`):
   - Props: `children`, `requiredModuleId`, `minLevel?: 'access' | 'view' | 'edit' | 'delete'` (por defecto `access`).
   - Usa el hook de Fase 1; si no cumple → redirección a `/dashboard` o página “Sin acceso” coherente con la UI.
2. Envolver layouts o páginas sensibles:
   - `dashboard/club/page.tsx`, `staff`, `academy`, `players`, `instalaciones`, bloques de metodología mapeados, etc.
3. Alternativa más centralizada: en `dashboard/layout.tsx`, leer `pathname`, resolver `moduleId` con `ROUTE_TO_CLUB_MODULE` y un prefijo longest-match; si no hay permiso → redirect.

**Recomendación**: empezar con **guard por página** en las 5–8 rutas más críticas; luego refactor a layout si repetición molesta.

**Criterio de aceptación**  
- URL directa sin permiso → no se muestra contenido operativo; mensaje claro.

---

## Fase 4 — Acciones dentro de pantalla (`view` / `edit` / `delete`)

**Acción**  
1. Exportar helpers desde `club-permissions.ts`:
   - `can(profile, matrix, moduleId, 'edit')` etc.
2. Hook cliente `useClubModulePermissions(moduleId)` (`src/hooks/use-club-module-permissions.ts`): expone `canView` / `canEdit` / `canDelete` más `loading` / `bypass` (misma fuente que sidebar y `ClubRouteGuard`).
3. En páginas con botones destructivos o formularios:
   - Deshabilitar u ocultar según `edit` / `delete`.
4. Mantener **validación en API** donde exista riesgo (Fase 5) para no confiar solo en la UI.

**Metodología (alcance cerrado en producto para esta fase)**  
Las rutas bajo `/dashboard/methodology/*` siguen el mapa de Fase 0: **`exercises`** (biblioteca) y **`planner`** (planificador compacto/sheet, almacén club, sincronización/agenda según pantalla). El **hub** ESTRATEGIA_CENTRAL solo muestra tarjetas cuyo destino tiene `access` en la matriz para el rol actual. Pantallas mayormente de lectura u objetivos (`objectives`, `cycle-planner`, navegación de calendario, etc.) pueden no requerir toggles si no mutan datos sensibles; revisar si más adelante deben ocultarse completamente sin `view`.

---

## Fase 5 — API `/api/club/*` (defensa en profundidad)

**Principio**: la matriz es **autorización de aplicación**; **RLS** sigue siendo la verdad para filas. Aun así, rutas que no puedan expresarse solo con RLS deberían comprobar rol + matriz en servidor.

**Implementado**  
- `src/lib/club-matrix-api-guard.ts`: lectura de `club_staff_access_matrices` con el **mismo JWT** del request (anon + `Authorization`), normalización con `buildDefaultStaffAccessMatrix` + `normalizeStaffAccessMatrix`, y `guardClubModuleOr403(gate, token, moduleId, level)`.  
- Rutas bajo `src/app/api/club/*` que mutan o exponen datos por módulo: ver tabla de estado arriba.  
- **Nota**: no se añadió guard al GET de `staff-access-matrix` porque el JSON define permisos de **todos** los módulos y el `ClubAccessMatrixProvider` lo necesita aunque el rol no tenga “Acceder” al ítem Staff del menú (el sidebar ya filtra rutas).

**Acción residual**  
- Nuevos endpoints `/api/club/*`: repetir el patrón `verifyClubSessionFromRequest` + `guardClubModuleOr403` según módulo.  
- Operativa Supabase directa (sin API) sigue dependiendo de RLS; no duplicar matriz en cada RPC salvo requisito de negocio.

**Criterio de aceptación**  
- Un usuario malicioso que parchea el cliente no puede ejecutar operaciones que la matriz prohíbe **en endpoints donde añadáis este chequeo** (gradual).

---

## Fase 6 — Coherencia con matriz Staff (ver/crear roles)

**Acción**  
1. Ya existe lógica en `staff/page.tsx` sobre `viewRoles` / `createRoles`.  
2. Revisar que use la **misma normalización** que el hook global (Fase 1).  
3. Asegurar que si `access` al módulo `staff` es falso, el guard de ruta bloquea antes de montar la lista.

---

## Fase 7 — QA y criterios de cierre

- Matriz por defecto (nuevo club): todos los módulos con `access/view` razonables según negocio.  
- Cambio en Admin & Permisos → sin recargar app completa: idealmente `refetch` del contexto tras guardar (evento o callback).  
- Pruebas manuales: dos navegadores / dos roles; verificar menú + URL + botón deshabilitado.  
- Registro en `BITACORA_TRABAJO_HIBRIDO.md` al cerrar cada fase.

---

## Orden de implementación recomendado

1. **Fase 0** (mapa + tipos)  
2. **Fase 1** (hook + context)  
3. **Fase 2** (sidebar)  
4. **Fase 3** (guards en rutas críticas)  
5. **Fase 6** (alinear Staff)  
6. **Fase 4** (botones por nivel)  
7. **Fase 5** (API donde haga falta)

---

## Riesgos y decisiones pendientes

- **Metodología vs `MODULES` del admin**: en producto, el nodo metodología queda cubierto por **`exercises`** + **`planner`** según `resolveClubModuleForPath`; si en el futuro se separan submódulos (p. ej. almacén propio), ampliar `CLUB_MODULE_IDS` y el admin en bloque.  
- **`club_admin`**: bypass local documentado en `club-permissions.ts` / hook (mismo criterio que sidebar).  
- **Rendimiento**: una sola carga por sesión de dashboard con context evita tormenta de requests.

---

*Documento generado para ejecutar el modelo “director comercial vs director de producción” a nivel de producto: **menos enlaces, rutas bloqueadas, acciones acotadas**, con Supabase como capa dura de datos.*
