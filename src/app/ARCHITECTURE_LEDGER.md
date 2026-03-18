
# SynqSports Pro - ARCHITECTURE_LEDGER v17.0.0 (Edición Táctica Avanzada)

Este documento es el registro maestro inmutable de la arquitectura técnica, protocolos de seguridad y flujos de trabajo de SynqSports Pro.

## 12. Inmersión y Ergonomía (v12.0.0 - v12.6.0)
- **v12.0.0**: **PROTOCOL_IMMERSIVE_CANVAS**: Rediseño de pizarras para ocupar el 100% de la pantalla. Cabeceras y herramientas flotantes. Sidebar oculto por defecto para maximizar área de dibujo en tablets.
- **v12.6.0**: **PROTOCOL_TABLET_FIRST_ERGONOMICS**: Incremento del breakpoint móvil a 1024px. El Sidebar ahora es un Drawer en tablets por defecto. Reducción del ancho master a 14rem para maximizar área operativa.

## 13. Reactividad y Movimiento (v16.0.0 - v16.9.0)
- **v16.0.0**: **PROTOCOL_INTELLIGENT_LAYER_SYSTEM**: Implementación de detección automática de intención (Dibujo vs Movimiento) mediante jerarquía de Z-Index.
- **v16.2.0**: **PROTOCOL_SMOOTH_FORMATION_ENGINE**: Restauración de las transiciones elásticas en jugadores vinculadas a cambios de formación y fases tácticas. Corrección de dependencias de renderizado.
- **v16.5.0**: **PROTOCOL_TOOL_COMPACT_DENSITY**: Reducción de escala en la isla de dibujo central (0.85x) para liberar visión en la base del campo táctico.
- **v16.7.0**: **PROTOCOL_CLEAN_PERIPHERY**: Eliminación de controles de configuración vacíos en la Pizarra de Partido para evitar distracciones visuales.
- **v16.8.0**: **PROTOCOL_TOP_HEADER_RESPONSIVENESS**: Re-escalado de los módulos superiores para evitar colisiones visuales entre el marcador, el cronómetro y el mando de herramientas en dispositivos de 1024px.
- **v16.9.0**: **PROTOCOL_HARDWARE_ACCELERATION**: Implementación de `translate3d` y optimización de renderizado para tablets antiguas. Re-escalado dinámico de jugadores para visualización óptima en PC.

## 14. Motor Táctico Profesional (v17.0.0)
- **v17.0.0**: **PROTOCOL_PHASE_CALIBRATION**: Ajuste de rangos de movimiento táctico. El bloque defensivo ahora habita el área grande propia y el ofensivo presiona en el área rival mediante offsets de -15% a +25% sobre la base de formación.
