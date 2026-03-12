
# SynqSports Pro - ARCHITECTURE_LEDGER v9.8.5 (Edición Integrada)

Este documento es el registro maestro inmutable de la arquitectura técnica, protocolos de seguridad y flujos de trabajo de SynqSports Pro.

## 5. Protocolo de Pizarra y Drawing (v9.8.5)

### 5.1. Independencia de Resolución (v9.4.0)
- **Coordenadas Decimales**: Migración de píxeles a sistema normalizado (0.000 a 1.000). Garantiza que los ejercicios se vean idénticos en cualquier pantalla.

### 5.6. Edición Directa en Toolbar (v9.8.0)
- **Live Text Input**: Eliminación de prompts externos. La edición de texto se realiza mediante un Input integrado en la cabecera que se activa al seleccionar el elemento.

### 5.7. Geometría Circular Garantizada (v9.8.1)
- **Corrección de Aspect Ratio**: Implementación de forzado 1:1 en píxeles para jugadores, círculos, balones y setas. Elimina la distorsión de óvalos en campos rectangulares.

### 5.8. Inteligencia de Dorsales (v9.8.2)
- **Autoincremento al Duplicar**: Al clonar un 'player', el nuevo elemento recibe automáticamente el número n+1.

### 5.9. Corrección de Enrutamiento (v9.8.3)
- **Fix Link Imports**: Corrección de importaciones erróneas de `Link` (desde `next/navigation` en lugar de `next/link`).

### 5.10. Blindaje de Interacción (v9.8.5)
- **Fix ReferenceError (Cross-Terminal)**: Reparación del error de ejecución al redimensionar objetos (`maxY is not defined`). Normalización del acceso a variables de límites (`bounds.maxY`, `bounds.maxX`) en los motores de Entrenamiento y Promo.
