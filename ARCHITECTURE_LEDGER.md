
# SynqSports Pro - ARCHITECTURE_LEDGER v9.7.5 (Sincronización Global)

Este documento es el registro maestro inmutable de la arquitectura técnica, protocolos de seguridad y flujos de trabajo de SynqSports Pro.

## 5. Protocolo de Pizarra y Dibujo (v9.7.5)

### 5.1. Independencia de Resolución (v9.4.0)
- **Coordenadas Decimales**: Migración de píxeles a sistema normalizado (0.000 a 1.000). Garantiza que los ejercicios se vean idénticos en cualquier pantalla.

### 5.2. Curvatura y Geometría Dinámica (v9.5.0)
- **Curvas de Bezier**: Implementación de nodos de control azules en flechas y zigzags para trayectorias curvas.
- **Creación Universal**: Inserción instantánea de materiales en el centro del campo.

### 5.3. Gestión de Capas y Edición (v9.7.1)
- **Z-Index Automático**: Los materiales técnicos se renderizan por encima de los dibujos.
- **Multiselección Pro**: Soporte para Shift+Click y edición masiva.

### 5.4. Integridad Metodológica (v9.7.2)
- **Metadata Sheet**: Integración obligatoria de ficha técnica al guardar.

### 5.5. Sincronización Funcional Promo (v9.7.3)
- **Paridad Total**: La Pizarra Promo hereda el 100% de las herramientas del Estudio de Entrenamiento.

### 5.6. Reparación de Interacción de Texto (v9.7.5)
- **Hitbox Expansion**: Aumento del área de detección de clics en textos para facilitar la selección.
- **Top-Layer Rendering**: El texto se dibuja ahora en la capa superior absoluta para evitar bloqueos por otros objetos.
- **Direct Edit Fix**: Corrección de la lógica de sincronización para asegurar que el prompt de edición funcione tanto en canvas como en cabecera.
