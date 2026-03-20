
# SynqSports Pro - ARCHITECTURE_LEDGER v52.0.0 (PWA Identity)

Este documento es el registro maestro inmutable de la arquitectura técnica, protocolos de seguridad y flujos de trabajo de SynqSports Pro.

## 44. Protocolo de Interfaz Live Aligerada (v44.0.0)
- **v44.0.0**: **PROTOCOL_MATCH_UI_LEAN**: Eliminación de la opción "Medio Campo" en la Pizarra de Partido para evitar sobrecarga visual y errores operativos en directo. Se fija la vista en Campo Completo para máxima visibilidad táctica.

## 45. Protocolo de Persistencia Garantizada (v45.0.0)
- **v45.0.0**: **PROTOCOL_MATCH_SAVE_RESTORE**: Restauración del botón "GUARDAR" en la cabecera de la Pizarra de Partido. Se optimiza su diseño para evitar solapamientos en tablets, asegurando que la persistencia de datos local sea una función primaria ininterrumpida.

## 46. Protocolo de Ergonomía Unificada (v46.0.0)
- **v46.0.0**: **PROTOCOL_BOTTOM_UNIFIED_CONTROLS**: Traslado de la barra de herramientas central (dibujo y estado) a la parte inferior de la Pizarra de Partido. Se alinea con los bloques de formación y fases para agrupar toda la operativa en una sola zona de interacción, despejando la visión táctica superior.

## 47. Protocolo de Expansión Ergonómica (v47.0.0)
- **v47.0.0**: **PROTOCOL_EXPANDED_BOTTOM_CONTROLS**: Eliminación de escalas reducidas en la zona inferior. Aumento de altura de contenedores a h-12 para mejorar los objetivos táctiles en tablets de campo.

## 48. Protocolo de Reequilibrio Táctico (v48.0.0)
- **v48.0.0**: **PROTOCOL_TABLET_SAFE_CONTROLS**: Rediseño de la cuadrícula de controles inferiores para evitar desbordamientos laterales. Corrección de error de referencia `showLanes` e integración de botón de carriles en el mando central. Inversión del bloque visitante para simetría visual total.

## 49. Protocolo de Precisión UI Tablet (v49.0.0)
- **v49.0.0**: **PROTOCOL_TABLET_PRECISION_UI**: Aplicación de factor de escala 0.85 en dispositivos móviles/tablets para controles inferiores. Reducción de altura a h-10 y anchos de Select a w-20. Optimización de gaps y paddings para garantizar visibilidad total sin desbordamientos.

## 50. Protocolo de Composición Superior (v50.0.0)
- **v50.0.0**: **PROTOCOL_SCOREBOARD_SHIFT**: Desplazamiento horizontal del marcador hacia la derecha (`left-20 lg:left-32`) para evitar interferencias visuales con el botón de retorno del sistema y equilibrar la composición superior en tablets.

## 51. Protocolo de Presets Cronométricos (v51.0.0)
- **v51.0.0**: **PROTOCOL_CHRONO_PRESETS**: Integración de selector de tiempos preconfigurados (15-45 min) y unificación de bordes cian en el bloque de telemetría superior de la Pizarra de Partido.

## 52. Protocolo de Identidad PWA (v52.0.0)
- **v52.0.0**: **PROTOCOL_PWA_IDENTITY**: Configuración de iconos de instalación maskable y metadatos de branding para iOS/Android, asegurando que el logotipo de SynqAI aparezca correctamente en la pantalla de inicio tras la instalación.
