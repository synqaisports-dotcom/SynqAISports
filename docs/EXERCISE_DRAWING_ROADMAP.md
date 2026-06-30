# Pizarra de dibujo deportivo — análisis y roadmap

## Referencia: Camelot / OnFormación (RFEF)

Vídeo de referencia del club: [Tutorial Camelot Tarea - OnFormación | FFIB-RFEF](https://www.youtube.com/watch?v=vC_xz9ybKx0) (TecnoFanes).

**Camelot** es la herramienta que usa la metodología RFEF/FFIB para documentar tareas de entrenamiento en OnFormación. No es una pizarra de trazos libres: es un **editor de diagramas sobre campo** con objetos deportivos y líneas de movimiento.

### Implementado (v3 — Pizarra SynqAI)

| Camelot / OnFormación | SynqAI (v3) |
|----------------------|-------------|
| Pantalla completa para dibujar | `ExerciseDrawingStudio` — viewport 100 %, campo = área de pintar |
| Botoneras flotantes materiales / herramientas | Docks inferiores «Material» y «Herramientas» |
| Jugadores, conos, balones, porterías | Texturas canvas HD (`drawing-material-assets.ts`) + Konva |
| Flechas, líneas, curvas, ondas, zonas | `shape-line`, `shape-arrow`, `shape-curve`, `shape-wave`, `shape-rect` |
| Grosor, discontinua, color | `StrokeStyle` + panel de propiedades flotante |
| Rotación y escala de objetos | Konva `Transformer` + sliders en material |
| Puntos de anclaje en líneas/curvas | Círculos arrastrables en extremos y control de curva |

### Pendiente (Fases 4+)

| Fase | Contenido |
|------|-----------|
| **4** | Animación paso a paso (keyframes por elemento); timeline; export vídeo/GIF para consulta del entrenador |
| **5** | Capas por fase de ejercicio; duplicar escena; alineaciones predefinidas |
| **6** | Export PNG/PDF alta resolución; biblioteca de materiales con imágenes reales (PNG del club) |

## Modelo de datos `drawing_json` v3

```json
{
  "version": 3,
  "field": "football-full",
  "elements": [
    {
      "id": "el-…",
      "type": "shape-line",
      "x1": 0.3, "y1": 0.5, "x2": 0.7, "y2": 0.5,
      "arrowStart": false, "arrowEnd": true,
      "style": { "color": "#fbbf24", "width": 3, "dash": false }
    },
    {
      "id": "el-…",
      "type": "material",
      "material": "player-own",
      "x": 0.5, "y": 0.5,
      "rotation": 0, "scale": 1, "label": "9"
    }
  ]
}
```

- Coordenadas **normalizadas 0..1** respecto al rectángulo del campo (independientes del tamaño en pantalla).
- **Migración**: v2 y v1 se convierten automáticamente en `parseExerciseDrawing()`.
- Sin cambio de columna en BD: sigue siendo `drawing_json jsonb` en `synq_exercises` y copia en slots.
- El modelo v3 está pensado para **keyframes de animación** (cada elemento tiene id estable y transformaciones explícitas).

## Materiales: canvas vs imágenes

En v3 los materiales se renderizan con **texturas generadas en canvas** (128×128, sombras y gradientes). Esto supera los SVG planos anteriores y escala bien en Konva.

**Próximo paso recomendado**: permitir subir PNG del club (conos naranjas, chalecos, etc.) manteniendo el mismo `MaterialKind` y un mapa `kind → url` en configuración. El editor ya soporta `HTMLImageElement` vía `getMaterialImage()`.

## Archivos clave

| Archivo | Rol |
|---------|-----|
| `src/lib/exercise-drawing.ts` | Esquema v3, parse, migración, geometría |
| `src/lib/drawing-material-assets.ts` | Catálogo y texturas canvas HD |
| `src/components/methodology/drawing/ExerciseDrawingStudio.tsx` | Editor fullscreen Konva |
| `src/components/methodology/drawing/ExerciseDrawingTrigger.tsx` | Entrada en ficha + miniatura |
| `src/components/methodology/drawing/DrawingScene.tsx` | Preview SVG (ficha, listados, impresión) |
| `src/components/methodology/drawing/FieldBackground.tsx` | Plantillas de campo |

## Uso en ficha

En ejercicios y slots, el formulario muestra **Crear dibujo** o **Modificar dibujo**. Al pulsar «Crear» se abre la pizarra a pantalla completa. El layout split del formulario UEFA muestra la miniatura del campo a la izquierda y los campos de texto a la derecha.
