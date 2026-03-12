
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

## 5. Protocolo de Pizarra y Drawing (v9.4.0 - v9.8.7)

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
- **Live Text Input**: Eliminación de prompts externos. La edición de texto se realiza mediante un Input integrado en la cabecera que se activa al seleccionar el elemento.

### 5.7. Geometría Circular Garantizada (v9.8.1)
- **Corrección de Aspect Ratio**: Implementación de forzado 1:1 en píxeles para jugadores, círculos, balones y setas. Elimina la distorsión de óvalos en campos rectangulares.

### 5.8. Inteligencia de Dorsales (v9.8.2)
- **Autoincremento al Duplicar**: Al clonar un 'player', el nuevo elemento recibe automáticamente el número n+1.

### 5.9. Corrección de Enrutamiento (v9.8.3)
- **Fix Link Imports**: Corrección de importaciones erróneas de `Link` (desde `next/navigation` en lugar de `next/link`).

### 5.10. Blindaje de Interacción (v9.8.5)
- **Fix ReferenceError (Global)**: Reparación definitiva del error de ejecución al redimensionar objetos (`maxY is not defined`). Normalización del acceso a variables de límites (`bounds.maxY`, `bounds.maxX`) en todos los terminales tácticos.

### 5.11. Sincronización de Materiales (v9.8.6)
- **Fidelidad Total**: Portado del motor de renderizado de alta resolución (sombras, gradientes y texturas) a la Pizarra Promo, garantizando paridad visual absoluta con la versión profesional.

### 5.12. Unificación Funcional (v9.8.7)
- **Activación de Carriles en Promo**: Eliminación del indicador de capacidad limitada en el header de Promo para sustituirlo por el control de "Carriles Tácticos", unificando la experiencia de usuario entre todos los niveles de acceso.
