# Periodización y sesiones — pendiente al crear la BBDD en producción

Este documento recoge lo implementado en **demo-first** (UI + `localStorage`) y lo que debe aplicarse en Supabase cuando el entorno de producción esté listo.

## Migraciones a aplicar (orden)

| Archivo | Contenido |
|---------|-----------|
| `20260710000000_periodization_plans.sql` | Planes por categoría (`synq_periodization_plans`) |
| `20260711000000_periodization_variant_links.sql` | `category_slug`, `plan_mcc_id`, `plan_variant_id` en microciclos |
| `20260712000000_team_microcycle_forks.sql` | `is_template`, `template_microcycle_id`, fork por equipo |
| `20260713000000_microcycle_session_slots.sql` | `session_index` en slots, `sessions_per_micro` en microciclos |

## Modelo objetivo: microciclo → sesiones → slots

```
MCC (planograma)
  └── Microciclo plantilla (is_template = true, team_id = null)
        ├── Sesión 1 → slots [calent., princ.×N, vuelta calma]
        ├── Sesión 2 → mismos tipos de slot
        └── Sesión 3 → (si variante 3 sesiones/semana)
```

### `synq_microcycles` (campos de periodización)

| Columna | Tipo | Notas |
|---------|------|-------|
| `category_slug` | text | Categoría cantera (alevin, infantil, …) |
| `plan_mcc_id` | text | ID del MCC en el documento de periodización |
| `plan_variant_id` | text | `variant-2` o `variant-3` |
| `week_end` | date | Fin de semana del MCC |
| `is_template` | boolean | Plantilla de variante vs instancia de equipo |
| `template_microcycle_id` | uuid | FK a plantilla si es fork |
| `sessions_per_micro` | smallint | 2 o 3 |
| `main_tasks_per_session` | smallint | 2 o 3 principales por sesión |

### `synq_microcycle_slots`

| Columna | Tipo | Notas |
|---------|------|-------|
| `session_index` | smallint | 1..`sessions_per_micro` |
| `slot_type` | text | `warmup` \| `main` \| `cooldown` |
| `order_index` | int | Orden dentro de la sesión (0..4) |
| `sheet_json` | jsonb | Ficha UEFA editable por slot |
| `exercise_id` | uuid | Vínculo opcional a biblioteca |

**Índice único:** `(microcycle_id, session_index, order_index)`

### Cálculo de slots al crear desde MCC

```
total_slots = sessions_per_micro × (1 + main_tasks_per_session + 1)
```

Ejemplo variante 3 sesiones × 3 principales = 3 × 5 = **15 slots**.

Implementación: `buildMicrocycleSlotSeeds()` en `src/lib/microcycle-sessions.ts`.

## Pendiente en biblioteca de ejercicios

| Campo | Estado | Uso previsto |
|-------|--------|--------------|
| `category_slug` en `synq_exercises` | **No migrado** | Filtrar biblioteca por categoría del microciclo |
| `task_type` | Migrado (`20260705000000`) | Filtrar por calent. / principal / vuelta calma |

**Workaround demo:** query param `?categorySlug=alevin` en “Añadir ejercicio”; se muestra en UI y se documenta en notas hasta tener columna.

## Demo vs producción

| Funcionalidad | Demo (`localStorage`) | Producción (Supabase) |
|---------------|----------------------|------------------------|
| Plan periodización | `synq-periodization-{slug}` | `synq_periodization_plans` |
| Microciclos demo ID | `demo-micro-*` en `synq-demo-microcycles` | Tabla `synq_microcycles` |
| Slots demo | Dentro del registro demo | `synq_microcycle_slots` |
| Hidratación demo | Si falta el registro, se reconstruye desde `synq-periodization-{slug}` (`hydrateDemoMicrocycle`) | N/A |
| Asignar ejercicio | Action + fallback demo store | `updateMicrocycleSlot` / `assignExerciseToSlot` |

Clave localStorage: `synq-demo-microcycles` — ver `src/lib/demo-microcycles-store.ts`.

## Backfill de datos existentes

Si ya hay microciclos con slots sin `session_index`:

1. Aplicar migración `20260713000000`.
2. Los slots existentes quedan en `session_index = 1` (default).
3. Opcional: script para duplicar slots a sesiones 2 y 3 según `plan_variant_id`:

```sql
-- Ejemplo conceptual; ejecutar con cuidado en staging
-- INSERT INTO synq_microcycle_slots (...)
-- SELECT ... session_index = 2 FROM ... WHERE session_index = 1;
```

4. Rellenar `sessions_per_micro` y `main_tasks_per_session` en microciclos creados desde MCC:

```sql
update synq_microcycles
set sessions_per_micro = 3, main_tasks_per_session = 3
where plan_variant_id = 'variant-3' and sessions_per_micro is null;
```

## Rutas UI (ya implementadas)

| Ruta | Descripción |
|------|-------------|
| `/portal/metodologia/microciclos/[id]` | Resumen + selector de sesiones |
| `/portal/metodologia/microciclos/[id]/sesiones/[n]` | Estructura 50 % + biblioteca 50 % |
| `/portal/metodologia/microciclos/[id]/sesiones/[n]/slots/[slotId]` | Editor slot 40 % pizarra + 60 % ficha |

## Portal entrenador (fase posterior)

- Leer slots reales de instancias por equipo (`team_id` + `plan_mcc_id`).
- Sustituir sesiones virtuales en `CoachPortalView` por datos de `synq_microcycle_slots`.

## Checklist despliegue

- [ ] Aplicar las 4 migraciones de periodización en orden
- [ ] Verificar RLS en `synq_periodization_plans`
- [ ] Crear plantilla desde MCC y comprobar 15 slots (variante 3×3)
- [ ] Fork a equipo y comprobar copia de todos los `session_index`
- [ ] Probar asignación ejercicio → slot en sesión 2
- [ ] (Opcional) Migrar `category_slug` a `synq_exercises`
