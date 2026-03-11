
# SynqSports Pro - ARCHITECTURE_LEDGER v9.2.0 (Capas y Opacidad)

Este documento es el registro maestro inmutable de la arquitectura técnica, protocolos de seguridad y flujos de trabajo de SynqSports Pro.

## 1. Seguridad y Protocolos de Acceso

### 1.1. Protocolo_Elite (Superadmin Bypass)
- **Emails Autorizados**: `munozmartinez.ismael@gmail.com`, `synqaisports@gmail.com`, `admin@synqai.sports`.
- **Lógica de Bypass**: Implementada en `firestore.rules` y `auth-context.tsx`. Permite visibilidad total sobre todos los clubes y usuarios de la red.

### 1.2. Matriz Jerárquica de Mandos (Ranking System)
Los roles operan bajo un sistema de ranking numérico (`rank`) que determina la autoridad.

## 5. Protocolo de Pizarra y Dibujo (v9.2.0)

### 5.1. Motor de Dibujo Suavizado
- Uso de lógica de interpolación para trazos fluidos en el Canvas e independencia de resolución.

### 5.2. Esquema JSON Maestro (Independencia de Dispositivo)
- **Coordenadas Decimales**: Todas las posiciones de fichas y trazos se guardan como valores de `0.000` a `1.000`. Garantiza fidelidad visual en cualquier dispositivo.

### 5.3. Estándar de Integridad Visual (v8.8.0)
- **Escala Proporcional Obligatoria**: Los materiales técnicos utilizan un algoritmo de redimensionado simétrico para evitar deformaciones.
- **Balón Hyper-Realistic**: Renderizado 3D con gradientes radiales, sombra proyectada y patrón técnico de costura.

### 5.4. Interfaz Estratégica y Control Avanzado (v9.2.0)
- **Acciones en Cabecera**: El menú de propiedades aparece dinámicamente en el header superior al seleccionar elementos.
- **Multiselección Pro**: Soporte para selección de múltiples objetos (Shift+Click) y edición masiva de propiedades.
- **Control de Opacidad Dinámico**: Implementación de un Slider en el header para ajustar la transparencia del 10% al 100%.
- **Gestión de Capas (Z-Index)**: Los materiales técnicos se renderizan siempre por encima de las formas de dibujo para garantizar su accesibilidad.
- **Sincronización de Renderizado**: Corrección del retardo en la visualización de nuevos activos técnicos.
- **Biblioteca de Élite**: Incorporación del activo "Barrera de Jugadores" con renderizado volumétrico profesional.
