
# SynqSports Pro - ARCHITECTURE_LEDGER v9.8.7 (Edición Integrada)

Este documento es el registro maestro inmutable de la arquitectura técnica, protocolos de seguridad y flujos de trabajo de SynqSports Pro.

## 1. Cimientos y Núcleo (v1.0 - v2.5)
- **v1.0.0**: Arquitectura base en Next.js 15 (App Router), TypeScript y Tailwind CSS.
- **v1.2.0**: Integración de Firebase Auth y Firestore (Estructura NoSQL para multi-tenant).
- **v2.0.0**: Sistema de Sidebars dinámicos y navegación por roles (Superadmin, Coach, Admin).
- **v2.5.0**: Implementación de ShadCN UI para componentes de alta fidelidad.

## 2. Gestión Operativa (v3.0 - v5.0)
- **v3.0.0**: Módulos maestros de Club, Staff, Cantera y Jugadores con validación Zod.
- **v4.0.0**: Terminal de Instalaciones con gestión de subdivisiones y horarios.
- **v5.0.0**: Suite Metodológica: Objetivos por etapas y Planificador de Ciclos.

## 3. Inteligencia Artificial y Sincronización (v6.0 - v8.5)
- **v6.0.0**: Integración de Genkit + Google Gemini 1.5 Flash para generación de planes y ejercicios.
- **v7.0.0**: Protocolo Visual "Neural": Glassmorphism, efectos de escaneo y temas diferenciados (Cyan, Amber, Emerald).
- **v8.0.0**: Núcleo Global (Superadmin) para gestión de red de clubes y facturación.
- **v8.5.0**: Sistema de Magic Links y QR para captación regional automatizada.

## 4. Evolución del Motor Táctico (v9.0 - v9.3)
- **v9.1.0**: Implementación de Multiselección (Shift+Click) y Capas (Z-Index) en el motor de dibujo.
- **v9.2.0**: Cruz de Movimiento Avanzada y Herramienta de Texto Táctico.
- **v9.3.0**: Integración de Slider de Opacidad y estilos de línea (Sólida/Dashed).

## 5. Protocolo de Pizarra y Dibujo (v9.4.0 - v9.8.7)

### 5.1. Independencia de Resolución (v9.4.0)
- **Coordenadas Decimales**: Migración de píxeles a sistema normalizado (0.000 a 1.000). Garantiza que los ejercicios se vean idénticos en cualquier pantalla (Mobile, Tablet, 4K).

### 5.2. Curvatura Dinámica (v9.5.0)
- **Motor Bezier**: Implementación de nodos de control azules para flechas y zigzags, permitiendo trayectorias curvas realistas.

### 5.3. Validación de Parámetros (v9.7.2)
- **Inputs Numéricos**: Normalización de campos de tiempo y dorsales para evitar errores de tipo string.

### 5.4. Paridad de Red (v9.7.3)
- **Sincronización Promo/Pro**: Portado del motor avanzado de dibujo a la Pizarra Promo, manteniendo identidad visual Cyan.

### 5.5. Blindaje de Texto (v9.7.5)
- **Hitbox Expandida**: Mejora del área de colisión para selección de consignas y renderizado forzado en capa superior.

### 5.6. Edición Directa en Toolbar (v9.8.0)
- **Toolbar Text Control**: Sustitución del botón de edición por un campo Input directo en la barra de herramientas. Permite modificar consignas en tiempo real sin perder el foco.

### 5.7. Geometría Circular Garantizada (v9.8.1)
- **Square Bounding Box**: Los elementos circulares ahora calculan su altura normalizada en base al ancho y al aspect ratio para forzar una visualización 1:1 real.

### 5.8. Inteligencia de Dorsales (v9.8.2)
- **Duplicate Sequencer**: Al copiar un atleta, el clon se genera con el dorsal incrementado en una unidad (n+1).

### 5.9. Corrección de Enrutamiento (v9.8.3)
- **Fix Link Imports**: Corrección de importaciones de `Link` que causaban fallos en micro-apps tácticas.

### 5.10. Blindaje de Interacción (v9.8.5)
- **Fix ReferenceError (Global)**: Reparación definitiva del error de ejecución al redimensionar objetos (`maxY is not defined`). Sincronización total de los punteros de redimensionamiento con el objeto `bounds` en todos los terminales.

### 5.11. Sincronización de Materiales (v9.8.6)
- **Paridad Funcional**: Migración del motor de renderizado avanzado (Gradients, Patterns, Shadows) desde Entrenamiento a Promo.

### 5.12. Control de Carriles en Promo (v9.8.7)
- **Lanes Activation**: Habilitación del sistema de carriles tácticos en la Pizarra Promo y eliminación del widget de capacidad para optimizar el flujo de trabajo del usuario invitado.
