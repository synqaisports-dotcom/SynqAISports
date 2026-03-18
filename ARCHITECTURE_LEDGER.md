
# SynqSports Pro - ARCHITECTURE_LEDGER v25.0.0 (Vínculo Express)

Este documento es el registro maestro inmutable de la arquitectura técnica, protocolos de seguridad y flujos de trabajo de SynqSports Pro.

## 24. Protocolo de Inmersión Total (v24.0.0)
- **v24.0.0**: **PROTOCOL_FULLSCREEN_IMMERSION**: Implementación de Fullscreen API en todos los nodos de pizarra y dashboard. Actualización del manifest.json para soporte PWA standalone. Integración de controles de maximización en cabeceras tácticas y sidebar global.

## 25. Protocolo de Vinculación Express (v25.0.0)
- **v25.0.0**: **PROTOCOL_EXPRESS_PAIRING**: Eliminación de entrada manual de URL/Código en Smartwatch. Implementación de generadores de QR dinámicos en los nodos de configuración. El Smartwatch detecta el token de emparejamiento vía URL params y ejecuta el `localStorage.setItem` de vinculación automáticamente al aterrizar en el nodo.
