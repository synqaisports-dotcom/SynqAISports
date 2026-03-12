
# SynqSports Pro - ARCHITECTURE_LEDGER v9.8.4 (Edición Integrada)

Este documento es el registro maestro inmutable de la arquitectura técnica, protocolos de seguridad y flujos de trabajo de SynqSports Pro.

## 5. Protocolo de Pizarra y Dibujo (v9.8.4)

### 5.1. Independencia de Resolución (v9.4.0)
- **Coordenadas Decimales**: Migración de píxeles a sistema normalizado (0.000 a 1.000). Garantiza que los ejercicios se vean idénticos en cualquier pantalla.

### 5.2. Curvatura y Geometría Dinámica (v9.5.0)
- **Curvas de Bezier**: Implementación de nodos de control azules en flechas y zigzags para trayectorias curvas.
- **Creación Universal**: Inserción instantánea de materiales en el centro del campo.

### 5.3. Gestión de Capas y Edición (v9.7.1)
- **Z-Index Automático**: Los materiales técnicos se renderizarán por encima de los dibujos. El texto siempre ocupa la capa superior absoluta.

### 5.4. Integridad Metodológica (v9.7.2)
- **Metadata Sheet**: Integración obligatoria de ficha técnica dual al guardar.

### 5.5. Sincronización Funcional Promo (v9.7.3)
- **Paridad Total**: La Pizarra Promo hereda el 100% de las herramientas del Estudio de Entrenamiento.

### 5.6. Edición Directa en Toolbar (v9.8.0)
- **Live Text Input**: Eliminación de prompts externos. La edición de texto se realiza ahora mediante un Input integrado en la cabecera que se activa al seleccionar el elemento.

### 5.7. Geometría Circular Garantizada (v9.8.1)
- **Corrección de Aspect Ratio**: Implementación de forzado 1:1 en píxeles para jugadores, círculos, balones y setas. Elimina la distorsión de óvalos en campos rectangulares.

### 5.8. Inteligencia de Dorsales (v9.8.2)
- **Autoincremento al Duplicar**: Implementación de lógica secuencial en la función de copiado. Si se duplica un elemento 'player', el nuevo elemento recibe automáticamente el número n+1.

### 5.9. Corrección de Enrutamiento (v9.8.3)
- **Fix Link Imports**: Corrección de importaciones erróneas de `Link` (desde `next/navigation` en lugar de `next/link`) que causaban errores de tipo de elemento inválido en los terminales de pizarra y login.

### 5.10. Blindaje de Interacción (v9.8.4)
- **Fix ReferenceError**: Corrección de fallo de referencia en el motor de redimensionamiento de la Pizarra Promo (`maxY is not defined`). Normalización del acceso a variables de límites de objetos.
