
# SynqSports Pro - ARCHITECTURE_LEDGER v15.6.0 (Edición Fluidez Táctica)

Este documento es el registro maestro inmutable de la arquitectura técnica, protocolos de seguridad y flujos de trabajo de SynqSports Pro.

## 11. Control de Superficie y Roster (v9.36.0 - v9.42.0)
- **v9.36.0**: **PROTOCOL_FIELD_SELECTOR_LOGIC**: Implementación del selector de superficie (F11, F7, Futsal) condicional en la Pizarra de Partido.
- **v9.37.0**: **PROTOCOL_SANDBOX_ANALYTICS**: Implementación de la terminal de estadísticas locales para el Sandbox.
- **v9.38.0**: **PROTOCOL_ANALYTIC_EXPORT**: Implementación de botón de exportación PDF en la terminal de estadísticas.
- **v9.39.0**: **PROTOCOL_OFFLINE_ADS_SYNC**: Implementación de cola de eventos (localStorage) para registro offline.
- **v9.40.0**: **PROTOCOL_WEATHER_TELEMETRY**: Integración de widget meteorológico en Sandbox.
- **v9.41.0**: **PROTOCOL_WATCH_UNIVERSAL_GEOMETRY**: Soporte para esferas cuadradas/redondas.
- **v9.42.0**: **PROTOCOL_LOCAL_IDENTITY_EXPANSION**: Formulario extendido de identidad en el Sandbox.

## 12. Inmersión y Ergonomía (v12.0.0 - v12.6.0)
- **v12.0.0**: **PROTOCOL_IMMERSIVE_CANVAS**: Rediseño de pizarras para ocupar el 100% de la pantalla. Cabeceras y herramientas flotantes. Sidebar oculto por defecto para maximizar área de dibujo en tablets.
- **v12.1.0**: **PROTOCOL_FULL_WIDTH_PITCH**: Eliminación definitiva del sidebar en layouts de pizarra. Maximización del ancho del campo al 98% en tablets. Compactación de toolbars para evitar desbordamientos en pantallas 4:3.
- **v12.2.0**: **PROTOCOL_INTERACTION_ENGINE_RESTORE**: Restauración del motor de redimensionado, rotación y curvas en la Pizarra Promo. Optimización de eventos táctiles para manipulación de elementos en entorno inmersivo.
- **v12.3.0**: **PROTOCOL_TACTICAL_FIDELITY_SYNC**: Sincronización total de materiales y herramientas de dibujo entre los modos Pro y Promo. Corrección del área de dibujo para ocupar el 100% del campo táctico.
- **v12.4.0**: **PROTOCOL_TACTICAL_FIDELITY_TOTAL**: Restauración de los diseños técnicos detallados de materiales (Porterías, Barreras, Vallas) y paridad funcional de 8 tiradores de control en el modo Sandbox.
- **v12.5.0**: **PROTOCOL_SMOOTH_INTERACTION_V2**: Optimización de rendimiento para tablets de baja gama. Corrección de la visibilidad de tiradores de control y aumento del área de contacto táctil.
- **v12.6.0**: **PROTOCOL_TABLET_FIRST_ERGONOMICS**: Incremento del breakpoint móvil a 1024px. El Sidebar ahora es un Drawer en tablets por defecto. Reducción del ancho master a 14rem para maximizar área operativa.

## 13. Rendimiento y Fluidez (v14.0.0 - v14.2.0)
- **v14.0.0**: **PROTOCOL_PERFORMANCE_OPTIMIZATION**: Ajuste de densidades y escalado 0.8x en paneles flotantes para tablets. Eliminación de efectos GPU redundantes para asegurar 60fps en dispositivos móviles.
- **v14.1.0**: **PROTOCOL_SMOOTH_FORMATION_RESTORE**: Restauración de las transiciones cinemáticas (`transition-all`) en cambios de formación. Reajuste de escala de los chips de jugadores para entorno tablet. Implementación de `will-change` para aceleración por hardware.
- **v14.2.0**: **PROTOCOL_STABILITY_RESTORE**: Corrección de error de sintaxis en `PlayerChip.tsx`. Restauración de importaciones críticas y utilidad `cn` en `admin-global/page.tsx`. Blindaje del auto-cierre del Sidebar tras navegación en tablets.

## 14. Maximización del Área Operativa (v15.0.0 - v15.6.0)
- **v15.0.0**: **PROTOCOL_MAX_PITCH_SURFACE**: Ajuste del componente `TacticalField` para ocupar el 98% del ancho y 96% del alto de la pantalla, maximizando el área táctica en tablets y PC.
- **v15.1.0**: **PROTOCOL_TELEMETRY_RELOCATION**: Reubicación del cronómetro y controles de tiempo a la esquina superior derecha, separándolos del marcador central para mayor limpieza visual.
- **v15.2.0**: **PROTOCOL_WATCH_PAIRING_RESTORE**: Restauración de la funcionalidad de vinculación de Smartwatch mediante código de 6 dígitos en diálogo independiente.
- **v15.3.0**: **PROTOCOL_SCORE_ISLAND_INDEPENDENCE**: Extracción del marcador de goles a una isla independiente en el extremo superior izquierdo para liberar el eje central.
- **v15.4.0**: **PROTOCOL_TIMER_CONTROLS_EXPANSION**: Implementación de controles explícitos (Play, Pause, Reset) en la isla de telemetría superior derecha para mayor precisión operativa.
- **v15.5.0**: **PROTOCOL_DECOUPLED_CONTROLS**: Extracción de los selectores de formación de las islas de equipo para mejorar la modularidad y evitar sobrecarga visual en el contenedor principal.
- **v15.6.0**: **PROTOCOL_ATOMIZED_PHASES**: Desacoplamiento de las barras de fase táctica (DEF, TDA, SAL, ATK) en módulos independientes para maximizar la limpieza visual y la ergonomía táctil en tablets.
