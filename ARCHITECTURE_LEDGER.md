# SynqSports Pro - Architecture Ledger v1.1 (Full Sync)

Este documento es el registro maestro de las estructuras de datos, flujos de trabajo y protocolos de interfaz validados. Sirve como backup estructural inmutable para evitar regresiones.

## 1. Módulo de Academia (Cantera)

### 1.1. Formulario de Vinculación de Equipo
**Ubicación**: `src/app/dashboard/academy/page.tsx`
**Esquema de Datos**:
- **Identidad**: Categoría Federativa (Nodo Troncal), Sufijo (Letra A-Z).
- **Staff Técnico (Orden Jerárquico Estricto)**: 
  1. Coordinador de Etapa
  2. Primer Entrenador
  3. Segundo Entrenador
  4. Delegado
  5. Preparador Físico
- **Logística**: Instalación Asignada, Zona Específica (Detección reactiva de subdivisiones).

### 1.2. Protocolos de UI en Roster
- **Segmentación de Nodo**: El nombre del equipo y las acciones están separados en contenedores independientes (`flex-1` vs `shrink-0`).
- **Truncado Inteligente**: Uso de `truncate` en el nombre para evitar desbordamiento en la cuadrícula de 4 columnas.
- **Estado de Nodo**: Soporta estados `Active` y `Paused` con notificación `toast` segura fuera del ciclo de renderizado.

## 2. Módulo de Instalaciones (Activos Físicos)

### 2.1. Configuración Geométrica y Temporal
**Ubicación**: `src/app/dashboard/instalaciones/page.tsx`
**Campos Críticos**:
- **Subdivisiones**: Espacio Único, 2 Mitades, 4 Cuadrantes.
- **Protocolo de División Temporal**: Horario de División Activa (`divisionStartTime`, `divisionEndTime`) para definir cuándo el campo es divisible por el motor de planificación.
- **Operativa**: Nombre, Tipo, Deporte, Capacidad de Atletas, Días Operativos (L-D), Estatus Red (Activo, Mantenimiento, Inactivo).

## 3. Módulo de Jugadores (Inscripciones)

### 3.1. Ficha Técnica del Atleta
**Ubicación**: `src/app/dashboard/players/page.tsx`
**Esquema de Identidad**:
- **Campos Primarios**: Nombre, Apellidos, Nº Camiseta (Dorsal), Apodo Deportivo (Nombre de Guerra).
- **Sincronización**: Email Atleta, Fecha Nacimiento, Fecha Alta.
- **Táctico**: Categoría, Equipo, Posiciones (Multiselección neón), Estatus (Activo, Lesionado, Ausencia).
- **Protección de Menores**: Check de Menor de Edad + Matriz de Tutor Legal (Nombre, Apellidos, Teléfono, Mail).

### 3.2. Ajustes de Precisión UI (Fixes)
- **Visibilidad Temporal**: Uso de `[color-scheme:dark]` en inputs de fecha para visualizar el icono del calendario en temas oscuros.
- **Corrección de Clipping**: Padding derecho `pr-10` en selectores de fecha para evitar que el radio de borde `rounded-2xl` recorte el icono del calendario.

## 4. Micro-App: Pizarra Táctica (Tactical Board)

### 4.1. Motor de Partido (Match Board)
**Ubicación**: `src/app/board/match/page.tsx`
**Protocolos**:
- **Sustitución por Arrastre (Drag & Drop)**: Captura de identidad en `onDragStart` y ejecución de `swap` en `onDrop` para sincronizar roster lateral y fichas en campo.
- **Marcador Compacto**: Tipografía reducida (`text-base` / `text-xl`) optimizada para tablets.
- **Basculación Táctica**: Controles de desplazamiento lateral (Izq, Centro, Der) con corrección de cierre de funciones de estado.

## 5. Motores de IA (Genkit)

### 5.1. Flujos de Generación
- **Neural Planner**: Generación de planes de entrenamiento basados en deporte, nivel y objetivos.
- **Exercise Architect**: Creación de módulos tácticos individuales con variaciones de progresión.
- **Promo Factory**: Generación de Magic Links y campañas regionales con parámetros de uso limitado.

## 6. Seguridad y Acceso Global

### 6.1. Protocolo_Elite (Bypass)
- **Superadmin Access**: Bypass en `firestore.rules` y `auth-context.tsx` para correos autorizados (`munozmartinez.ismael@gmail.com`, `synqaisports@gmail.com`).
- **Jerarquía de Mando**: Matriz de roles con rangos numéricos que impiden a un usuario gestionar a uno de rango superior o igual.

---
*Este Ledger es el único punto de verdad para la reconstrucción de funcionalidades en caso de simplificación del código fuente.*
