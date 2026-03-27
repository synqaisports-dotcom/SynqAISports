
# SynqSports Pro - ARCHITECTURE_LEDGER v72.0.0 (Freemium to Pro)

Este documento es el registro maestro inmutable de la arquitectura técnica, protocolos de seguridad y flujos de trabajo de SynqSports Pro.

## 61. Protocolo de Etiquetado Ergonómico (v61.0.0)
- **v61.0.0**: **PROTOCOL_LABEL_ERGONOMICS**: Implementación de nombres visibles junto a los iconos en la Toolbar. Reducción de escala de iconos a h-3.5 para optimizar el espacio en paneles laterales de tablets.

## 62. Protocolo de Inmersión Total (v62.0.0)
- **v62.0.0**: **PROTOCOL_FULL_SCREEN_CANVAS**: Expansión del TacticalField al 100% del viewport. El fondo de campo es infinito y las líneas reglamentarias se auto-ajustan manteniendo su proporción para evitar distorsiones visuales.

## 63. Protocolo de Orientación Horizontal (v63.0.0)
- **v63.0.0**: **PROTOCOL_HORIZONTAL_HALF_FIELD**: Rediseño del modo medio campo para proyectarse de forma horizontal/panorámica (Ratio 1.6), anclando la línea central en el borde inferior del lienzo.

## 64. Protocolo de Monetización Bilateral (v64.0.0)
- **v64.0.0**: **PROTOCOL_BILATERAL_AD_NODES**: Eliminación de slots publicitarios laterales y superiores. Implementación de doble banner horizontal en la base de la pantalla, asignando un nodo de impacto a cada mitad del campo táctico.

## 65. Protocolo de Escala Proporcional (v65.0.0)
- **v65.0.0**: **PROTOCOL_UI_SCALING_NORMALIZATION**: Implementación de escala reducida (0.8x) para cabeceras en tablets y móviles. Uso de origin-top para mantener la proporción visual idéntica a la versión de escritorio.

## 66. Protocolo de Integración de Cabecera (v66.0.0)
- **v66.0.0**: **PROTOCOL_HEADER_ASSET_INTEGRATION**: Migración de controles laterales derechos (Dibujo y Tareas) a la barra superior para despejar el lienzo.

## 67. Protocolo de Unificación de Cabecera (v67.0.0)
- **v67.0.0**: **PROTOCOL_TOTAL_HEADER_CONSOLIDATION**: Migración de controles laterales izquierdos (Equipo y Materiales) a la barra superior. Lienzo 100% libre de obstáculos.

## 68. Protocolo de Flujo de Diseño (v68.0.0)
- **v68.0.0**: **PROTOCOL_AUTO_CLOSE_SHEETS**: Implementación de cierre automático de paneles laterales (Sheets) tras la selección de herramientas o materiales. Optimización del flujo de dibujo para evitar clics adicionales de cierre manual.

## 69. Protocolo de Ergonomía Móvil (v69.0.0)
- **v69.0.0**: **PROTOCOL_MOBILE_CHIP_SCALING**: Aumento de escala de los jugadores (h-8) para visibilidad en móviles. Ajuste de márgenes de seguridad (10%) para evitar que los jugadores se salgan del campo en pantalla completa.

## 70. Protocolo de Encuadre Panorámico (v70.0.0)
- **v70.0.0**: **PROTOCOL_PANORAMIC_VIEWPORT**: Inversión de anclaje en medio campo (top-0) para asegurar la visibilidad de la portería. Ajuste de ratio a 1.5 para tablets.

## 71. Protocolo de Barrera Profesional (v71.0.0)
- **v71.0.0**: **PROTOCOL_PROFESSIONAL_BARRIER_DUMMIES**: Rediseño del activo de barrera. Sustitución de elipses por maniquíes tácticos con cabeza y hombros definidos, mejorando la estética del "Stylebook" oficial.

## 72. Protocolo Freemium -> Pro (v72.0.0)
- **v72.0.0**: **PROTOCOL_FREEMIUM_TO_PRO**: Formalizacion del modelo de negocio en dos capas de persistencia. `/board/*` opera como Hook de Adquisicion con `localStorage` (gratis, sin friccion, coste de infraestructura casi cero). La operativa profesional de club migra a Supabase bajo suscripcion (1EUR/mes) para auth, multiusuario y datos centralizados.
