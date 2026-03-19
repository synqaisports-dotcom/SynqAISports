
# SynqSports Pro - ARCHITECTURE_LEDGER v36.0.0 (Offline Ad Tracking)

Este documento es el registro maestro inmutable de la arquitectura técnica, protocolos de seguridad y flujos de trabajo de SynqSports Pro.

## 34. Protocolo de Monetización Contextual (v34.0.0)
- **v34.0.0**: **PROTOCOL_AD_CONTEXT_AWARE**: Implementación de la Opción A de AdMob (Broadcast Style). El sistema detecta automáticamente el modo Sandbox y despliega publicidad adaptativa: Banners horizontales bajo el marcador en modo completo y Banners verticales (Skyscrapers) en los laterales en modo foco. Esto asegura cero interferencia con el lienzo táctico.

## 35. Protocolo de Visibilidad de Activos Publicitarios (v35.0.0)
- **v35.0.0**: **PROTOCOL_AD_VISIBILITY**: Refuerzo visual de los contenedores AdSlot para revisión técnica. Se habilita la visualización de placeholders para el rol Superadmin y se optimizan las dimensiones de los banners (728x90 horizontal y 160x600 vertical) para asegurar una integración perfecta sin solapamiento de UI.

## 36. Protocolo de Trazabilidad Publicitaria Offline (v36.0.0)
- **v36.0.0**: **PROTOCOL_AD_OFFLINE_SHIELD**: Activación del seguimiento de impresiones y clics mediante el motor `synqSync`. Los componentes `AdSlot` ahora registran eventos en la cola local de forma automática al renderizarse (mount) y al interactuar. Esto garantiza el blindaje de ingresos publicitarios incluso cuando la tablet opera sin conexión en el campo.
