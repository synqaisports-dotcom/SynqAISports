
# SynqSports Pro - ARCHITECTURE_LEDGER v9.7.3 (Sincronización Global)

Este documento es el registro maestro inmutable de la arquitectura técnica, protocolos de seguridad y flujos de trabajo de SynqSports Pro.

## 1. Seguridad y Protocolos de Acceso

### 1.1. Protocolo_Elite (Superadmin Bypass)
- **Emails Autorizados**: `munozmartinez.ismael@gmail.com`, `synqaisports@gmail.com`, `admin@synqai.sports`.
- **Lógica de Bypass**: Implementada en `firestore.rules` y `auth-context.tsx`. Permite visibilidad total sobre todos los clubes y usuarios de la red.

## 5. Protocolo de Pizarra y Dibujo (v9.7.3)

### 5.1. Independencia de Resolución (v9.4.0)
- **Coordenadas Decimales**: Migración de píxeles a sistema normalizado (0.000 a 1.000). Garantiza que los ejercicios se vean idénticos en móviles, tablets y monitores 4K.

### 5.2. Curvatura y Geometría Dinámica (v9.5.0)
- **Curvas de Bezier**: Implementación de nodos de control azules en flechas y zigzags para trayectorias curvas.
- **Creación Universal**: Inserción instantánea de materiales en el centro del campo con un solo clic.

### 5.3. Gestión de Capas y Edición (v9.7.1)
- **Z-Index Automático**: Los materiales técnicos se renderizan siempre por encima de los dibujos para asegurar su selección.
- **Multiselección Pro**: Soporte para Shift+Click y edición masiva de propiedades (color, opacidad).
- **Control de Opacidad**: Slider dinámico en cabecera (10% a 100%).
- **Contraste de Interfaz**: Inputs con fondo `bg-black/40` para legibilidad óptima en exteriores.

### 5.4. Integridad Metodológica (v9.7.2)
- **Metadata Sheet**: Integración obligatoria de ficha técnica al guardar para evitar "registros vacíos".
- **Validación de Datos**: Campos numéricos para tiempo y carga de trabajo.

### 5.5. Sincronización Funcional Promo (v9.7.3)
- **Paridad de Funcionalidades**: La Pizarra Promo ahora dispone del 100% de las herramientas del Estudio de Entrenamiento (Bezier, Multiselección, Materiales Pro).
- **Identidad Cyan**: Preservación del esquema de color Cyan y restricciones de red para captación.
