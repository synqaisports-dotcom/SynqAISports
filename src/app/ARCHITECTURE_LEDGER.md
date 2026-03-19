
# SynqSports Pro - ARCHITECTURE_LEDGER v44.0.0 (Lean Match UI)

Este documento es el registro maestro inmutable de la arquitectura técnica, protocolos de seguridad y flujos de trabajo de SynqSports Pro.

## 34. Protocolo de Monetización Contextual (v34.0.0)
- **v34.0.0**: **PROTOCOL_AD_CONTEXT_AWARE**: Implementación de la Opción A de AdMob (Broadcast Style). El sistema detecta automáticamente el modo Sandbox y despliega publicidad adaptativa: Banners horizontales bajo el marcador en modo completo y Banners verticales (Skyscrapers) en los laterales en modo foco. Esto asegura cero interferencia con el lienzo táctico.

## 35. Protocolo de Visibilidad de Activos Publicitarios (v35.0.0)
- **v35.0.0**: **PROTOCOL_AD_VISIBILITY**: Refuerzo visual de los contenedores AdSlot para revisión técnica. Se habilita la visualización de placeholders para el rol Superadmin y se optimizan las dimensiones de los banners (728x90 horizontal y 160x600 vertical) para asegurar una integración perfecta sin solapamiento de UI.

## 36. Protocolo de Trazabilidad Publicitaria Offline (v36.0.0)
- **v36.0.0**: **PROTOCOL_AD_OFFLINE_SHIELD**: Activación del seguimiento de impresiones y clics mediante el motor `synqSync`. Los componentes `AdSlot` ahora registran eventos en la cola local de forma automática al renderizarse (mount) y al interactuar. Esto garantiza el blindaje de ingresos publicitarios incluso cuando la tablet opera sin conexión en el campo.

## 37. Protocolo de Ergonomía AdMob (v37.0.0)
- **v37.0.0**: **PROTOCOL_AD_TABLET_READY**: Ajuste de los puntos de ruptura (breakpoints) de los anuncios laterales. Se reduce el umbral de visibilidad de `xl` a `lg` para asegurar que los banners laterales sean visibles en tablets estándar cuando el campo está en modo foco.

## 38. Protocolo de Unificación Cromática (v38.0.0)
- **v38.0.0**: **PROTOCOL_UNIFIED_TEAM_COLORS**: Unificación visual de Local y Visitante a color Primary (Cian) para una estética aeroespacial monocromática.

## 39. Protocolo de Restauración de Identidad Rival (v39.0.0)
- **v39.0.0**: **PROTOCOL_RESTORE_VISITOR_COLOR**: Reversión de la unificación cromática. Se restaura el color Rose (Rojo) para el equipo visitante tanto en marcador, mandos tácticos como en fichas de jugador para mejorar la distinción operativa.

## 40. Protocolo de Calibración Ergonómica (v40.0.0)
- **v40.0.0**: **PROTOCOL_PLAYER_CHIP_SCALING**: Reducción del 20% en el tamaño de las fichas de jugador en la Pizarra de Partido para dispositivos tablet y escritorio. Mejora la visibilidad del lienzo y la precisión del dibujo táctico.

## 41. Protocolo de Aceleración Legacy (v41.0.0)
- **v41.0.0**: **PROTOCOL_LEGACY_HARDWARE_ACCELERATION**: Optimización de las transiciones tácticas para dispositivos antiguos. Se implementa forzado de GPU mediante `translateZ(0)` y curvas de tiempo reducidas (400ms) para garantizar una respuesta ágil en tablets de gama baja.

## 42. Protocolo de Limpieza de Campo (v42.0.0)
- **v42.0.0**: **PROTOCOL_SQUAD_CLEAR_ACTION**: Adición de la opción "NINGUNA" (Limpiar) en los selectores de formación. Permite vaciar el campo de jugadores instantáneamente para explicaciones técnicas de pizarra libre sin perder la configuración de partido.

## 43. Protocolo de Pincel Fluido (v43.0.0)
- **v43.0.0**: **PROTOCOL_SMOOTH_BRUSH_STROKES**: Sustitución del dibujo lineal simple por curvas de Bézier cuadráticas mediante algoritmo de punto medio. Suaviza los trazos manuales en todas las pizarras para una experiencia de dibujo profesional y orgánica.

## 44. Protocolo de Interfaz Live Aligerada (v44.0.0)
- **v44.0.0**: **PROTOCOL_MATCH_UI_LEAN**: Eliminación del botón "GUARDAR" y de la opción "Medio Campo" en la Pizarra de Partido para evitar sobrecarga visual y errores operativos en directo. Se elimina el banner publicitario por solapamiento con el área táctica en esta vista.
