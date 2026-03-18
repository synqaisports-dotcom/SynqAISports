
# SynqSports Pro - ARCHITECTURE_LEDGER v27.0.0 (Composición Sesión)

Este documento es el registro maestro inmutable de la arquitectura técnica, protocolos de seguridad y flujos de trabajo de SynqSports Pro.

## 25. Protocolo de Vinculación Express (v25.0.0)
- **v25.0.0**: **PROTOCOL_EXPRESS_PAIRING**: Eliminación de entrada manual de URL/Código en Smartwatch. Implementación de generadores de QR dinámicos en los nodos de configuración. El Smartwatch detecta el token de emparejamiento vía URL params y ejecuta el `localStorage.setItem` de vinculación automáticamente al aterrizar en el nodo.

## 26. Protocolo de Optimización de Hilo Principal (v26.0.0)
- **v26.0.0**: **PROTOCOL_PERFORMANCE_OVERHAUL**: Mitigación de bloqueos de UI (>800ms) mediante la reducción global de niveles de blur (33% menos carga GPU). Implementación de renderizado diferido en Sheets/Dialogs pesados y suspensión de ciclos de dibujo en Canvas durante interacciones de interfaz.

## 27. Protocolo de Composición de Sesión Sandbox (v27.0.0)
- **v27.0.0**: **PROTOCOL_SESSION_COMPOSITION_SANDBOX**: Activación del motor de ensamblaje de planes diarios. El sistema permite vincular tareas guardadas en los slots locales (Warmup, Main, Cool) para generar una ficha de sesión unificada lista para exportación PDF o dirección de partido.
