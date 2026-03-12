
# SynqSports Pro - ARCHITECTURE_LEDGER v9.8.7 (Edición Integrada)

Este documento es el registro maestro inmutable de la arquitectura técnica, protocolos de seguridad y flujos de trabajo de SynqSports Pro.

## 5. Protocolo de Pizarra y Dibujo (v9.8.7)

### 5.6. Edición Directa en Toolbar (v9.8.0)
- **Toolbar Text Control**: Sustitución del botón de edición por un campo Input directo en la barra de herramientas. Permite modificar consignas en tiempo real sin perder el foco.

### 5.7. Geometría Circular Garantizada (v9.8.1)
- **Square Bounding Box**: Los elementos circulares ahora calculan su altura normalizada en base al ancho y al aspect ratio para forzar una visualización 1:1 real.

### 5.8. Inteligencia de Dorsales (v9.8.2)
- **Duplicate Sequencer**: Al copiar un atleta, el clon se genera con el dorsal incrementado en una unidad (n+1).

### 5.9. Corrección de Enrutamiento (v9.8.3)
- **Fix Link Imports**: Corrección de importaciones de `Link` que causaban fallos en micro-apps tácticas.

### 5.10. Blindaje de Interacción (v9.8.5)
- **Fix ReferenceError (Global)**: Reparación definitiva del error de ejecución al redimensionar objetos (`maxY is not defined`). Sincronización total de los punteros de redimensionamiento con el objeto `bounds` en todos los terminales.

### 5.11. Sincronización de Materiales (v9.8.6)
- **Paridad Funcional**: Migración del motor de renderizado avanzado (Gradients, Patterns, Shadows) desde Entrenamiento a Promo.

### 5.12. Control de Carriles en Promo (v9.8.7)
- **Lanes Activation**: Habilitación del sistema de carriles tácticos en la Pizarra Promo y eliminación del widget de capacidad para optimizar el flujo de trabajo del usuario invitado.
