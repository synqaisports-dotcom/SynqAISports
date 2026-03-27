# Auditoría técnica - Historial (SynqAI Sports)

Este documento centraliza el histórico de auditorías técnicas del producto (backoffice, dashboard club, metodología, APIs y seguridad).

## Objetivo

- Mantener trazabilidad de hallazgos y decisiones.
- Diferenciar claramente entre:
  - **Riesgo real de producción**
  - **Decisión temporal de desarrollo** (atajos controlados para acelerar construcción)
- Facilitar planes de cierre por iteraciones.

## Convenciones de registro

- **Severidad**
  - 🔴 Crítica: puede comprometer seguridad/autorización o datos sensibles.
  - 🟠 Alta: riesgo funcional/seguridad relevante, pero acotado.
  - 🟡 Media: inconsistencia o deuda técnica con impacto moderado.
  - 🔵 Baja: mejora recomendada o riesgo menor.
- **Estado**
  - `abierto`, `aceptado_temporal`, `en_progreso`, `cerrado`.
- **Referencia**
  - Archivo/ruta y, cuando sea útil, línea aproximada.

---

## Auditoría #001 - 2026-03-27

### Alcance

- Nodo **Admin-global**.
- Nodo **Methodology** y secciones principales de **Dashboard club**.
- Endpoints `src/app/api/admin/*` y `src/app/api/club/*` relacionados.
- Enforcement de matriz de permisos (`access/view/edit/delete`).

### Contexto operativo declarado

- Se mantiene una vía de acceso/control para observar el desarrollo en paralelo desde consola.
- Este comportamiento se considera, por ahora, una **decisión temporal de desarrollo** y no un objetivo final de seguridad de producción.
- Objetivo de producto: disponer de un **backoffice robusto** para control integral de la app (estándar de mercado).

### Hallazgos registrados

1. **Bypass/flujo temporal de desarrollo para acceso administrativo**
   - Severidad: 🟡 Media (si queda acotado a entorno dev); 🔴 Crítica (si llega a producción sin control).
   - Estado: `aceptado_temporal`.
   - Nota: aceptado por decisión operativa para acelerar validación durante desarrollo.

2. **Bypass amplio en guard para perfiles free/promo (URL directa)**
   - Severidad: 🔴 Crítica.
   - Estado: `abierto`.
   - Referencia: `src/components/dashboard/ClubRouteGuard.tsx`.

3. **Roles sin fila explícita en matriz con comportamiento permisivo**
   - Severidad: 🔴 Crítica.
   - Estado: `abierto`.
   - Referencia: `src/lib/club-permissions.ts` (`canAccessClubModule`).

4. **GET de APIs club sin guard de módulo en algunas rutas**
   - Severidad: 🔴 Crítica.
   - Estado: `abierto`.
   - Referencias:
     - `src/app/api/club/methodology-academy/route.ts`
     - `src/app/api/club/methodology-warehouse/route.ts`
     - `src/app/api/club/staff-access-matrix/route.ts`

5. **Fallback permisivo en guard API cuando falla lectura de matriz**
   - Severidad: 🟠 Alta.
   - Estado: `abierto`.
   - Referencia: `src/lib/club-matrix-api-guard.ts`.

6. **/board fuera del enforcement unificado de matriz**
   - Severidad: 🟠 Alta.
   - Estado: `abierto`.
   - Referencia: `src/app/board/layout.tsx`.

7. **Validación de rol mejorable en actualización de usuarios admin**
   - Severidad: 🟠 Alta.
   - Estado: `abierto`.
   - Referencia: `src/app/api/admin/users/route.ts`.

8. **Doble fuente de verdad (localStorage/Supabase) sin señalización fuerte de modo**
   - Severidad: 🟡 Media.
   - Estado: `abierto`.
   - Referencias: `src/app/admin-global/{page,users,clubs,plans}/*`.

### Decisiones explícitas

- **DEC-001 (Temporal):** mantener mecanismo de acceso operativo para supervisión de desarrollo.
  - Condición: no consolidarlo como comportamiento por defecto en producción.
  - Revisión: re-evaluar cuando el backoffice esté funcionalmente completo.

### Plan de cierre sugerido (iterativo)

1. Cerrar bypass free/promo en guard de rutas (allowlist estricta).
2. Pasar matriz a denegación por defecto para roles no mapeados.
3. Añadir `guardClubModuleOr403` a GET sensibles de `/api/club/*`.
4. Convertir fallback de matriz en servidor a estrategia fail-closed.
5. Alinear `/board/*` con enforcement de matriz.
6. Endurecer validación de `role` en API admin users.

### Evidencia / notas

- Esta auditoría consolida revisión técnica del estado actual y decisiones operativas declaradas por producto.
- Se continuará agregando una nueva entrada por cada revisión relevante.

---

## Plantilla rápida para próximas auditorías

```md
## Auditoría #XXX - YYYY-MM-DD

### Alcance
- ...

### Contexto operativo declarado
- ...

### Hallazgos registrados
1. Título
   - Severidad:
   - Estado:
   - Referencia:
   - Nota:

### Decisiones explícitas
- DEC-XXX ...

### Plan de cierre sugerido (iterativo)
1. ...

### Evidencia / notas
- ...
```

---

## Auditoría #002 - 2026-03-27

### Alcance

- Nodo **Metodología** completo (`/dashboard/methodology/*`).
- Secciones relacionadas en dashboard (`sessions`, `academy`, `instalaciones`, `mobile-continuity`, `dashboard` hub).
- APIs de club asociadas (`/api/club/methodology-*`).
- Enforcement de matriz (`access/view/edit/delete`) y patrón híbrido Supabase + fallback local.

### Hallazgos registrados

1. **Claves localStorage sin ámbito de club en partes de metodología**
   - Severidad: 🔴 Crítica.
   - Estado: `abierto`.
   - Referencias:
     - `src/app/dashboard/methodology/exercise-library/page.tsx`
     - `src/app/dashboard/methodology/calendar/page.tsx`
   - Nota: riesgo de mezcla/fuga de datos entre clubes en el mismo navegador.

2. **Layout de metodología valida login pero no módulo/permisos**
   - Severidad: 🟠 Alta.
   - Estado: `abierto`.
   - Referencia: `src/app/dashboard/methodology/layout.tsx`.
   - Nota: URL directa puede cargar UI aunque sidebar oculte enlaces.

3. **GET de APIs metodología sin guard de módulo en rutas concretas**
   - Severidad: 🟠 Alta.
   - Estado: `abierto`.
   - Referencias:
     - `src/app/api/club/methodology-academy/route.ts` (GET)
     - `src/app/api/club/methodology-warehouse/route.ts` (GET)
   - Nota: desalineación con enforcement de matriz aplicado en UI y otras APIs.

4. **Matriz permisiva para roles sin fila explícita**
   - Severidad: 🟠 Alta.
   - Estado: `abierto`.
   - Referencia: `src/lib/club-permissions.ts` (`canAccessClubModule`).

5. **Hook de permisos concede todo si `role` es vacío**
   - Severidad: 🟡 Media.
   - Estado: `abierto`.
   - Referencia: `src/hooks/use-club-module-permissions.ts`.

6. **Estrategia híbrida no uniforme entre secciones**
   - Severidad: 🟡 Media.
   - Estado: `abierto`.
   - Referencias:
     - `src/app/dashboard/methodology/session-planner/page.tsx`
     - `src/app/dashboard/methodology/exercise-library/page.tsx`
     - `src/app/dashboard/methodology/warehouse/page.tsx`
   - Nota: variaciones de merge remoto/local sin señalización clara de modo al usuario.

7. **Modo prototipo visible en planner**
   - Severidad: 🔵 Baja.
   - Estado: `abierto`.
   - Referencia: `src/app/dashboard/methodology/session-planner/page.tsx`.

### Fortalezas detectadas

- `methodology-library` aplica guard por matriz en API (view/edit/delete) de forma consistente.
- Persistencia Supabase con RLS por club en tablas de metodología y operativa ya está establecida.
- Integración de matriz en sidebar y hooks compartidos evita duplicación excesiva de lógica.

### Plan de cierre sugerido (iterativo)

1. Scopear todas las claves de metodología por `clubId` y migrar lectura legacy.
2. Añadir guard de acceso por módulo en layout/rutas metodología.
3. Aplicar `guardClubModuleOr403` también en GET de academy/warehouse.
4. Endurecer comportamiento por defecto para roles no mapeados (deny-by-default).
5. Ajustar hook de permisos para `!role` como no autorizado (o loading), no bypass.
6. Unificar política de merge híbrido remoto/local y mostrar estado de sincronización.
7. Retirar/aislar modo prototipo del planner con feature flag.

### Pruebas críticas faltantes

- Tests de autorización por módulo en APIs `methodology-*` (200/403 por rol).
- Tests de no mezcla de datos al cambiar de club en el mismo navegador.
- Tests de deep-link a rutas metodología con matriz restrictiva.
- Tests de merge local/remoto en planner y biblioteca ante errores de API.

---

## Auditoría #003 - 2026-03-27

### Alcance

- Nodo **Dashboard Club** completo (`src/app/dashboard/**`).
- Secciones de metodología y operativa conectadas al dashboard.
- APIs de club relacionadas (`/api/club/*`) y patrón híbrido actual.

### Inventario resumido por estado

- **Remoto/Híbrido más maduro**
  - `dashboard/admin` y `dashboard/access-matrix` (matriz por API + fallback local).
  - `dashboard/methodology/exercise-library` (API + caché local).
  - `dashboard/methodology/academy` y `warehouse` (API + fallback local).
  - Guards de ruta/matriz en layout + sidebar.
- **Híbrido parcial / con deuda**
  - `dashboard/sessions`, `dashboard/mobile-continuity`, `dashboard/methodology/session-planner` (mezcla local + sync operativa remota).
- **Predominio mock/local**
  - `dashboard/club`, `dashboard/staff`, `dashboard/players`, `dashboard/instalaciones`.
  - `dashboard/methodology/objectives`, `cycle-planner`, `learning-items`.
  - `dashboard/coach/library` y parte de `dashboard/coach/*`.

### Hallazgos registrados

1. **Jugadores y roster en localStorage (sin fuente central por club)**
   - Severidad: 🔴 Crítica.
   - Estado: `abierto`.
   - Referencias: `src/app/dashboard/players/page.tsx`, consumo en `sessions` / `mobile-continuity`.

2. **Onboarding con fallback no UUID puede romper operativa Supabase**
   - Severidad: 🔴 Crítica.
   - Estado: `abierto`.
   - Referencias: `src/app/dashboard/coach/onboarding/page.tsx`, `src/lib/operativa-sync.ts` (`canUseOperativaSupabase`).

3. **Doble fuente de verdad en operativa (local + remoto)**
   - Severidad: 🟠 Alta.
   - Estado: `abierto`.
   - Referencias: `src/app/dashboard/sessions/page.tsx`, `src/app/dashboard/methodology/session-planner/page.tsx`.

4. **Gestión de Club sin persistencia real (UI/toast)**
   - Severidad: 🟠 Alta.
   - Estado: `abierto`.
   - Referencia: `src/app/dashboard/club/page.tsx`.

5. **Staff en modo demostración (lista inicial en código)**
   - Severidad: 🟡 Media.
   - Estado: `abierto`.
   - Referencia: `src/app/dashboard/staff/page.tsx`.

6. **Instalaciones duplicadas entre páginas con modelo local**
   - Severidad: 🟡 Media.
   - Estado: `abierto`.
   - Referencias: `src/app/dashboard/instalaciones/page.tsx`, `src/app/dashboard/methodology/warehouse/page.tsx`.

7. **Home del dashboard usa valores demo en ausencia de datos reales**
   - Severidad: 🔵 Baja.
   - Estado: `abierto`.
   - Referencia: `src/app/dashboard/page.tsx`.

### Plan de cierre sugerido (orden recomendado)

1. Forzar `clubId` UUID real en onboarding (sin fallback no compatible).
2. Migrar **Players** a persistencia remota por club (manteniendo fallback local controlado).
3. Unificar operativa (`sessions`/`session-planner`) para reducir divergencia local-remoto.
4. Persistir `dashboard/club` en API (dejar de ser solo mock UI).
5. Sustituir `staff` mock por fuente real del club.
6. Unificar modelo de instalaciones (una sola fuente para instalaciones + almacén).

### Notas para ejecución

- El nodo ya tiene base sólida de seguridad por matriz/rutas/API.
- El foco siguiente es **consistencia de datos** y cierre de pantallas aún mock.
