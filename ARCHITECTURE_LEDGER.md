
# SynqSports Pro - ARCHITECTURE_LEDGER v29.0.0 (Medio Campo Vertical)

Este documento es el registro maestro inmutable de la arquitectura técnica, protocolos de seguridad y flujos de trabajo de SynqSports Pro.

## 26. Protocolo de Optimización de Hilo Principal (v26.0.0)
- **v26.0.0**: **PROTOCOL_PERFORMANCE_OVERHAUL**: Mitigación de bloqueos de UI (>800ms) mediante la reducción global de niveles de blur (33% menos carga GPU). Implementación de renderizado diferido en Sheets/Dialogs pesados y suspensión de ciclos de dibujo en Canvas durante interacciones de interfaz.

## 27. Protocolo de Composición de Sesión Sandbox (v27.0.0)
- **v27.0.0**: **PROTOCOL_SESSION_COMPOSITION_SANDBOX**: Activación del motor de ensamblaje de planes diarios. El sistema permite vincular tareas guardadas en los slots locales (Warmup, Main, Cool) para generar una ficha de sesión unificada lista para exportación PDF o dirección de partido.

## 28. Protocolo de Sincronización de Plantilla Sandbox (v28.0.0)
- **v28.0.0**: **PROTOCOL_SANDBOX_SQUAD_SYNC**: Integración de la Pizarra Promo con la configuración de "Mi Equipo". Implementación de botón de volcado de titulares en Canvas basado en el `localStorage` de la sección equipo. El motor de dibujo ahora renderiza los nombres de los atletas vinculados automáticamente.

## 29. Protocolo de Maximización de Superficie (v29.0.0)
- **v29.0.0**: **PROTOCOL_VERTICAL_HALF_FIELD**: Implementación de modo de visualización de medio campo vertical en pizarras de ejercicios (Training/Promo). El sistema permite alternar dinámicamente entre campo completo y medio campo para ganar resolución y espacio de dibujo en tablets y PC.
