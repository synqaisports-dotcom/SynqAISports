
# SynqSports Pro - ARCHITECTURE_LEDGER v33.0.0 (Lanes Focus)

Este documento es el registro maestro inmutable de la arquitectura técnica, protocolos de seguridad y flujos de trabajo de SynqSports Pro.

## 25. Protocolo de Higiene de Interfaz (v31.0.0)
- **v31.0.0**: **PROTOCOL_UI_HYGIENE_REORG**: Optimización del árbol de navegación para perfiles de autoridad (Director de Metodología, Administrador de Club). Se elimina la redundancia de la "Pizarra Promo" en secciones estratégicas para centrar la operativa en herramientas Pro, manteniendo la versión Promo solo en el entorno Sandbox.

## 26. Protocolo de Estabilidad de Interacción (v32.0.0)
- **v32.0.0**: **PROTOCOL_INTERACTION_FIX**: Sincronización de correcciones en el motor de dibujo. Se garantiza que todas las pizarras tácticas (Training/Promo) utilicen el mismo estándar de acceso a coordenadas de colisión, eliminando ReferenceErrors en el hilo principal.

## 27. Protocolo de Carriles en Modo Foco (v33.0.0)
- **v33.0.0**: **PROTOCOL_LANES_HALF_FIELD**: Adaptación del motor de renderizado de `TacticalField` para proyectar carriles verticales en el modo medio campo vertical. Se mejora la utilidad del lienzo para el diseño de tareas sectorizadas por canales de juego.
