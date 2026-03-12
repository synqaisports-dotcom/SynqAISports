
# SynqSports Pro - ARCHITECTURE_LEDGER v9.8.2 (Edición Integrada)

Este documento es el registro maestro inmutable de la arquitectura técnica, protocolos de seguridad y flujos de trabajo de SynqSports Pro.

## 5. Protocolo de Pizarra y Dibujo (v9.8.2)

### 5.6. Edición Directa en Toolbar (v9.8.0)
- **Toolbar Text Control**: Sustitución del botón de edición por un campo Input directo en la barra de herramientas. Permite modificar consignas en tiempo real sin perder el foco de la pizarra.
- **Prioridad de Renderizado**: Los textos se dibujan siempre en la última fase del ciclo para evitar bloqueos por otros objetos.

### 5.7. Geometría Circular Garantizada (v9.8.1)
- **Square Bounding Box**: Los elementos circulares (player, ball, circle, seta) ahora calculan su altura normalizada en base al ancho y al aspect ratio del canvas para forzar una visualización 1:1 real.
- **Radius Fix**: El motor de dibujo ahora utiliza `min(width, height)` para asegurar que el trazo sea un círculo perfecto.

### 5.8. Inteligencia de Dorsales (v9.8.2)
- **Duplicate Sequencer**: El motor de clonación ahora reconoce metadatos de jugador. Al copiar un atleta, el clon se genera con el dorsal incrementado en una unidad (n+1), optimizando la creación de bloques defensivos u ofensivos.
