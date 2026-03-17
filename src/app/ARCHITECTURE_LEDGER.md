
# SynqSports Pro - ARCHITECTURE_LEDGER v12.2.0 (Edición Inmersión Total)

Este documento es el registro maestro inmutable de la arquitectura técnica, protocolos de seguridad y flujos de trabajo de SynqSports Pro.

## 11. Control de Superficie y Roster (v9.36.0 - v9.42.0)
- **v9.36.0**: **PROTOCOL_FIELD_SELECTOR_LOGIC**: Implementación del selector de superficie (F11, F7, Futsal) condicional en la Pizarra de Partido.
- **v9.37.0**: **PROTOCOL_SANDBOX_ANALYTICS**: Implementación de la terminal de estadísticas locales para el Sandbox.
- **v9.38.0**: **PROTOCOL_ANALYTIC_EXPORT**: Implementación de botón de exportación PDF en la terminal de estadísticas.
- **v9.39.0**: **PROTOCOL_OFFLINE_ADS_SYNC**: Implementación de cola de eventos (localStorage) para registro offline.
- **v9.40.0**: **PROTOCOL_WEATHER_TELEMETRY**: Integración de widget meteorológico en Sandbox.
- **v9.41.0**: **PROTOCOL_WATCH_UNIVERSAL_GEOMETRY**: Soporte para esferas cuadradas/redondas.
- **v9.42.0**: **PROTOCOL_LOCAL_IDENTITY_EXPANSION**: Formulario extendido de identidad en el Sandbox.

## 12. Inmersión y Ergonomía (v12.0.0 - v12.2.0)
- **v12.0.0**: **PROTOCOL_IMMERSIVE_CANVAS**: Rediseño de pizarras para ocupar el 100% de la pantalla. Cabeceras y herramientas flotantes. Sidebar oculto por defecto para maximizar área de dibujo en tablets.
- **v12.1.0**: **PROTOCOL_FULL_WIDTH_PITCH**: Eliminación definitiva del sidebar en layouts de pizarra. Maximización del ancho del campo al 98% en tablets. Compactación de toolbars para evitar desbordamientos en pantallas 4:3.
- **v12.2.0**: **PROTOCOL_INTERACTION_ENGINE_RESTORE**: Restauración del motor de redimensionado, rotación y curvas en la Pizarra Promo. Optimización de eventos táctiles para manipulación de elementos en entorno inmersivo.
