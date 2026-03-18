
# SynqSports Pro - ARCHITECTURE_LEDGER v16.0.0 (Edición Inteligente)

Este documento es el registro maestro inmutable de la arquitectura técnica, protocolos de seguridad y flujos de trabajo de SynqSports Pro.

## 15. Maximización del Área Operativa (v15.0.0 - v15.6.0)
- **v15.0.0**: **PROTOCOL_MAX_PITCH_SURFACE**: Ajuste del componente `TacticalField` para ocupar el 98% del ancho y 96% del alto de la pantalla.
- **v15.1.0**: **PROTOCOL_TELEMETRY_RELOCATION**: Reubicación del cronómetro a la esquina superior derecha.
- **v15.2.0**: **PROTOCOL_WATCH_PAIRING_RESTORE**: Restauración de la funcionalidad de vinculación de Smartwatch en diálogo independiente.
- **v15.3.0**: **PROTOCOL_SCORE_ISLAND_INDEPENDENCE**: Extracción del marcador de goles a una isla independiente superior izquierda.
- **v15.4.0**: **PROTOCOL_TIMER_CONTROLS_EXPANSION**: Controles de Play, Pause y Reset en la isla de telemetría.
- **v15.5.0**: **PROTOCOL_DECOUPLED_CONTROLS**: Extracción de selectores de formación de las islas de equipo.
- **v15.6.0**: **PROTOCOL_ATOMIZED_PHASES**: Desacoplamiento de las barras de fase táctica en módulos independientes.

## 16. Inteligencia Contextual (v16.0.0)
- **v16.0.0**: **PROTOCOL_AUTO_CONTEXT_DETECTION**: Eliminación de toggles manuales de modo (Pincel/Puntero). Implementación de jerarquía de capas (Z-40 para jugadores, Z-30 para canvas) para detección automática de intención. Implementación de motor de dibujo persistente en Pizarra de Partido.
