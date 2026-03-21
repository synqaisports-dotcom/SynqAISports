
# SynqSports Pro - ARCHITECTURE_LEDGER v60.0.0 (Immersive UI)

Este documento es el registro maestro inmutable de la arquitectura técnica, protocolos de seguridad y flujos de trabajo de SynqSports Pro.

## 52. Protocolo de Identidad PWA (v52.0.0)
- **v52.0.0**: **PROTOCOL_PWA_IDENTITY**: Configuración de iconos de instalación maskable y metadatos de branding para iOS/Android, asegurando que el logotipo de SynqAI aparezca correctamente en la pantalla de inicio tras la instalación.

## 53. Protocolo de Monetización Multiplex (v53.0.0)
- **v53.0.0**: **PROTOCOL_MULTIPLEX_RELOAD**: Optimización del componente AdSlot mediante memoización y animaciones CSS de bajo impacto para garantizar latencia cero en el área de dibujo táctico.

## 54. Auditoría de Rendimiento Legacy (v54.0.0)
- **v54.0.0**: **AUDIT_LEGACY_HARDWARE**: Análisis de latencia en dispositivos de 2018 (Huawei MediaPad T5). Identificación de cuellos de botella en filtros de post-procesado (backdrop-blur) y densidad de píxeles en Canvas. Se proponen tres vías de optimización: Supresión de filtros GPU, Downsampling de Lienzo y carga dinámica de módulos pesados.

## 55. Protocolo de Optimización de Hardware (v55.0.0)
- **v55.0.0**: **PROTOCOL_PERFORMANCE_OVERRIDE**: Implementación de la "Opción 1" (GPU Relief). Supresión dinámica de backdrop-filters en hardware detectado como legacy (Kirin 659 / Mali-T830). Estructuración de la lógica de renderScale para futura implementación de Downsampling (Opción 2).

## 56. Protocolo de Control DPI (v56.0.0)
- **v56.0.0**: **PROTOCOL_DPI_DOWNSAMPLING**: Implementación de la "Opción 2" (Canvas Downsampling). Reducción del buffer interno del Canvas al 75% (720p aprox) en hardware legacy detectado (MediaPad T5). El escalado CSS compensa el tamaño visual mientras que la GPU procesa un 44% menos de píxeles, eliminando el lag en el trazo.

## 57. Protocolo de Área de Trabajo Segura (v57.0.0)
- **v57.0.0**: **PROTOCOL_SAFE_WORK_AREA**: Reajuste de las dimensiones máximas del TacticalField. Se limita la altura al 72dvh para asegurar que el campo quepa siempre entre la cabecera superior y los controles inferiores sin cortarse en modo medio campo o campo completo en tablets.

## 58. Protocolo de Precisión de Lienzo (v58.0.0)
- **v58.0.0**: **PROTOCOL_PIXEL_PERFECT_CANVAS**: Sincronización milimétrica entre el contenedor y el área de dibujo mediante getBoundingClientRect y ResizeObserver. Se libera el desbordamiento (overflow-visible) para evitar cortes en los manejadores de selección en los bordes del campo.

## 59. Protocolo de Interfaz Inmersiva (v59.0.0)
- **v59.0.0**: **PROTOCOL_SIDE_ACCESS_PANELS**: Reestructuración de la Pizarra Promo para integrar paneles laterales deslizantes para el Equipo y el Almacén de Tareas, liberando el área de dibujo central.

## 60. Protocolo de Herramientas Flotantes (v60.0.0)
- **v60.0.0**: **PROTOCOL_IMMERSIVE_SIDEBAR_TOOLS**: Eliminación de la botonera inferior en la Pizarra Promo. Migración de las herramientas de dibujo y material técnico a paneles laterales tipo Sheet para maximizar el área de trabajo y mejorar la ergonomía en tablets.
