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
