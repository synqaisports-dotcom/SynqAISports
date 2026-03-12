
# SynqSports Pro - ARCHITECTURE_LEDGER v9.7.3 (Sincronización Global)

Este documento es el registro maestro inmutable de la arquitectura técnica, protocolos de seguridad y flujos de trabajo de SynqSports Pro.

## 1. Seguridad y Protocolos de Acceso

### 1.1. Protocolo_Elite (Superadmin Bypass)
- **Emails Autorizados**: `munozmartinez.ismael@gmail.com`, `synqaisports@gmail.com`, `admin@synqai.sports`.
- **Lógica de Bypass**: Implementada en `firestore.rules` y `auth-context.tsx`.

## 5. Protocolo de Pizarra y Dibujo (v9.7.3)

### 5.1. Motor de Independencia de Dispositivo (v9.4.0)
- Uso de lógica de coordenadas decimales (0.0 a 1.0) para garantizar fidelidad visual en cualquier resolución.

### 5.2. Herramientas Pro y Curvatura (v9.5.0)
- **Trayectorias Bezier**: Curvatura dinámica mediante nodos centrales en flechas.
- **Creación por Pulsación**: Los materiales técnicos se crean con dimensiones predeterminadas en el centro del campo.

### 5.3. Interfaz Estratégica y Capas (v9.7.1)
- **Z-Index Blindado**: Los materiales técnicos se dibujan siempre en la capa superior.
- **Multiselección**: Edición masiva de objetos seleccionados.
- **Slider de Opacidad**: Ajuste de transparencia del 10% al 100% en el header.
- **Optimización de Contraste**: Rediseño de inputs con fondo oscuro para evitar saturación de color amarillo.

### 5.4. Unificación de Ficha (v9.7.2)
- **Diseño Dual**: Formulario de biblioteca en dos columnas para optimizar espacio.
- **Validación de Tiempos**: Campo de duración convertido a tipo numérico para métricas IA.

### 5.5. Blindaje Funcional Promo (v9.7.3)
- **Sincronización Total**: Migración del motor de dibujo avanzado a la terminal de captación (Promo).
