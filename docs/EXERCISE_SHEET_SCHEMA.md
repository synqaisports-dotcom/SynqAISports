# Plantilla de ficha de ejercicio (UEFA / ABR)

Estructura compartida entre **portal metodología** (Supabase) y **Synq Coach Free** (SQLite local).

Basada en la plantilla del proyecto ABR UEFA: *Plantilla de tarea* por slot de sesión.

## Campos de la ficha

| Campo JSON | Etiqueta en ficha |
|------------|------------------|
| `title` | Título |
| `didacticStrategy` | Estrategia didáctica |
| `objectives` | Objetivos |
| `conditionalGrid.conditionalContent` | Contenido condicional |
| `conditionalGrid.time` | Tiempo |
| `conditionalGrid.space` | Espacio |
| `conditionalGrid.gameSituation` | Situación de juego |
| `conditionalGrid.coordination` | Coordinación |
| `technicalAction` | Acción técnica / habilidad coordinativa |
| `tacticalAction` | Acción táctica / intención |
| `collectiveContent` | Contenido de juego colectivo |
| `description` | Descripción |
| `rules` | Normas de provocación / normativa |
| `coachingCues` | Consignas |
| `taskType` | `warmup` · `main` · `cooldown` |

Además: `drawing_json` / pizarra (boceto) — separado de la ficha textual.

## Dónde se guarda

| Producto | Tabla | Columna |
|----------|-------|---------|
| Web metodología — biblioteca | `synq_exercises` | `sheet_json` |
| Web metodología — slot microciclo | `synq_microcycle_slots` | `sheet_json` |
| Coach Free — slot entreno | `exercise_slots` | `sheet_json` (JSON string) |

## Código de referencia

- Web: `src/lib/exercise-sheet.ts`
- Migración: `supabase/migrations/20260705000000_synqai_exercise_sheet.sql`
- Formulario web: `src/components/methodology/ExerciseSheetForm.tsx`
- Vista web: `src/components/methodology/ExerciseSheetView.tsx`
- Android: `apps/synq-coach/.../ExerciseSheet.kt` (misma estructura)

## Plantilla de microciclo (5 slots)

1. Calentamiento (`warmup`)
2. Tarea principal 1 (`main`)
3. Tarea principal 2 (`main`)
4. Tarea principal 3 (`main`)
5. Vuelta a la calma (`cooldown`)

## Versión

`templateVersion: 1` — incrementar si cambia el esquema.
