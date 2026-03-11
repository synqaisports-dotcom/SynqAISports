
# SynqSports Pro - ARCHITECTURE_LEDGER v9.5.0 (Curvatura y Edición Pro)

Este documento es el registro maestro inmutable de la arquitectura técnica, protocolos de seguridad y flujos de trabajo de SynqSports Pro.

## 1. Seguridad y Protocolos de Acceso

### 1.1. Protocolo_Elite (Superadmin Bypass)
- **Emails Autorizados**: `munozmartinez.ismael@gmail.com`, `synqaisports@gmail.com`, `admin@synqai.sports`.
- **Lógica de Bypass**: Implementada en `firestore.rules` y `auth-context.tsx`. Permite visibilidad total sobre todos los clubes y usuarios de la red.

## 5. Protocolo de Pizarra y Dibujo (v9.5.0)

### 5.1. Motor de Dibujo Suavizado
- Uso de lógica de interpolación para trazos fluidos en el Canvas e independencia de resolución.

### 5.2. Esquema JSON Maestro (Independencia de Dispositivo)
- **Coordenadas Decimales**: Todas las posiciones de fichas y trazos se guardan como valores de `0.000` a `1.000`. Garantiza fidelidad visual en cualquier dispositivo.

### 5.3. Curvatura Dinámica y Curvas de Bezier (v9.5.0)
- **Trayectorias Inteligentes**: Las flechas y zigzags integran un nodo de control central que permite modificar la curvatura del trazo mediante curvas cuadráticas de Bezier.
- **Creación Universal Instantánea**: Todas las herramientas de dibujo y materiales se crean mediante un solo clic en el centro del campo, eliminando la fricción del trazado manual inicial.

### 5.4. Interfaz Estratégica y Edición de Texto (v9.5.0)
- **Click-to-Edit**: Implementación de trigger automático para edición de texto táctico al insertar o seleccionar.
- **Acciones en Cabecera**: El menú de propiedades aparece dinámicamente en el header superior al seleccionar elementos.
- **Multiselección Pro**: Soporte para selección de múltiples objetos (Shift+Click) y edición masiva de propiedades.
- **Control de Opacidad Dinámico**: Implementación de un Slider en el header para ajustar la transparencia del 10% al 100%.
- **Gestión de Capas (Z-Index)**: Los materiales técnicos se renderizan siempre por encima de las formas de dibujo para garantizar su accesibilidad.
- **Sincronización de Renderizado**: Corrección del retardo en la visualización de nuevos activos técnicos mediante actualización síncrona de estado.
