
# SynqSports Pro - ARCHITECTURE_LEDGER v35.0.0 (Ad Visibility Mode)

Este documento es el registro maestro inmutable de la arquitectura técnica, protocolos de seguridad y flujos de trabajo de SynqSports Pro.

## 32. Protocolo de Estabilidad de Interacción (v32.0.0)
- **v32.0.0**: **PROTOCOL_INTERACTION_FIX**: Corrección de errores de referencia en el motor de redimensionamiento del Canvas. Se han blindado los accesos al objeto `bounds` en los eventos de puntero para evitar fallos de ejecución al manipular elementos tácticos en PC y Tablet.

## 33. Protocolo de Carriles en Modo Foco (v33.0.0)
- **v33.0.0**: **PROTOCOL_LANES_HALF_FIELD**: Extensión del sistema de carriles al modo vertical de medio campo. Se implementan divisiones verticales (20/80) para facilitar el dibujo de tareas basadas en canales de juego (bandas y pasillos interiores) en la vista ensanchada.

## 34. Protocolo de Monetización Contextual (v34.0.0)
- **v34.0.0**: **PROTOCOL_AD_CONTEXT_AWARE**: Implementación de la Opción A de AdMob (Broadcast Style). El sistema detecta automáticamente el modo Sandbox y despliega publicidad adaptativa: Banners horizontales bajo el marcador en modo completo y Banners verticales (Skyscrapers) en los laterales en modo foco. Esto asegura cero interferencia con el lienzo táctico.

## 35. Protocolo de Visibilidad de Activos Publicitarios (v35.0.0)
- **v35.0.0**: **PROTOCOL_AD_VISIBILITY**: Refuerzo visual de los contenedores AdSlot para revisión técnica. Se habilita la visualización de placeholders para el rol Superadmin y se optimizan las dimensiones de los banners (728x90 horizontal y 160x600 vertical) para asegurar una integración perfecta sin solapamiento de UI.
