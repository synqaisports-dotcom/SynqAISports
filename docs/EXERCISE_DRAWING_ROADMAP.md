# Pizarra de dibujo deportivo — análisis y roadmap

## Referencia: Camelot / OnFormación (RFEF)

Vídeo de referencia del club: [Tutorial Camelot Tarea - OnFormación | FFIB-RFEF](https://www.youtube.com/watch?v=vC_xz9ybKx0) (TecnoFanes).

**Camelot** es la herramienta que usa la metodología RFEF/FFIB para documentar tareas de entrenamiento en OnFormación. No es una pizarra de trazos libres: es un **editor de diagramas sobre campo** con objetos deportivos vectoriales.

### Patrones que replicamos (Fase 1 — implementado)

| Camelot / OnFormación | SynqAI (v2) |
|----------------------|-------------|
| Campo con proporción real (completo, medio, tercio) | `FieldTemplate` + `FieldBackground` SVG |
| Modal / pantalla casi completa para dibujar | `ExerciseDrawingModal` (~100 % viewport) |
| Campo ~40 % + herramientas | Grid 40 % campo / 60 % botonera |
| Icono crear / modificar según haya dibujo | `ExerciseDrawingTrigger` (Crear / Modificar) |
| Jugadores, conos, balones, porterías | Elementos SVG (`player`, `cone`, `ball`, `goal`) |
| Flechas y líneas de movimiento | `arrow`, `line`, `dashed-arrow` |
| Zonas sombreadas | `zone` |
| Edición por puntos de anclaje | `getElementAnchors` + drag en modo seleccionar |

### Pendiente (Fases 2–4)

| Fase | Contenido |
|------|-----------|
| **2** | Más objetos: vallas, escaleras, maniquíes, chalecos; rotación con asa visual |
| **3** | Capas por fase de ejercicio; duplicar sesión; alineaciones predefinidas |
| **4** | Animación paso a paso (keyframes); export PNG/PDF alta resolución; enlace embebido tipo vídeo en ficha |

## Modelo de datos `drawing_json` v2

```json
{
  "version": 2,
  "field": "football-full",
  "elements": [
    { "id": "el-…", "type": "player", "x": 0.5, "y": 0.5, "team": "own", "label": "9" }
  ],
  "legacyStrokes": []
}
```

- Coordenadas **normalizadas 0..1** respecto al campo (independientes del tamaño en pantalla).
- **Migración v1**: trazos antiguos (`strokes`) se conservan en `legacyStrokes` y se muestran superpuestos.
- Sin cambio de columna en BD: sigue siendo `drawing_json jsonb` en `synq_exercises` y copia en slots.

## Archivos clave

| Archivo | Rol |
|---------|-----|
| `src/lib/exercise-drawing.ts` | Esquema, parse, anclas, herramientas |
| `src/components/methodology/drawing/ExerciseDrawingModal.tsx` | Editor fullscreen |
| `src/components/methodology/drawing/ExerciseDrawingTrigger.tsx` | Entrada en ficha + miniatura |
| `src/components/methodology/drawing/FieldBackground.tsx` | Campos SVG |
| `src/components/methodology/drawing/DrawingScene.tsx` | Render elementos |

## Uso en ficha

En ejercicios y slots, el formulario muestra **Crear dibujo** o **Modificar dibujo** (no canvas inline de trazos). El layout split 40/60 del formulario UEFA usa la miniatura del campo a la izquierda y los campos de texto a la derecha.
