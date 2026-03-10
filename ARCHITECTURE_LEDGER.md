# SynqSports Pro - Architecture Ledger v1.0

Este documento sirve como registro maestro de las estructuras de datos, formularios y flujos de trabajo validados en la plataforma. Su propósito es actuar como backup estructural.

## 1. Módulo de Academia (Cantera)

### 1.1. Formulario de Vinculación de Equipo
**Ubicación**: `src/app/dashboard/academy/page.tsx`
**Campos Críticos**:
- **Identidad**: Categoría (Federativa), Sufijo (Letra A-Z).
- **Staff Técnico (Orden Jerárquico)**: 
  1. Coordinador de Etapa
  2. Primer Entrenador
  3. Segundo Entrenador
  4. Delegado
  5. Preparador Físico
- **Logística**: Instalación Asignada, Zona Específica (Detectada reactivamente si hay subdivisiones).

### 1.2. Protocolos de UI en Roster
- **Truncado Inteligente**: Los nombres de los equipos usan `truncate` para evitar desbordamientos en la rejilla.
- **Segmentación de Acciones**: Botones de gestión (Ver, Editar, Pausar, Borrar) agrupados en nodo `shrink-0` a la derecha.
- **Estado de Nodo**: Soporta estados `Active` y `Paused`.

## 2. Módulo de Instalaciones

### 2.1. Formulario de Configuración de Activos
**Ubicación**: `src/app/dashboard/instalaciones/page.tsx`
**Campos Críticos**:
- **Geometría de Espacio**: Subdivisions (Espacio Único, 2 Mitades, 4 Cuadrantes).
- **Protocolo Temporal**: Horario de División Activa (`divisionStartTime`, `divisionEndTime`) para definir cuándo el campo es divisible.
- **Operativa**: Nombre, Tipo, Deporte, Capacidad de Atletas, Días Operativos (L-D), Estatus Red.

## 3. Módulo de Jugadores (Inscripciones)

### 3.1. Ficha Técnica del Atleta
**Ubicación**: `src/app/dashboard/players/page.tsx`
**Campos Críticos**:
- **Identidad**: Nombre, Apellidos, Nº Camiseta (Dorsal), Apodo Deportivo.
- **Sincronización**: Email Atleta, Fecha Nacimiento, Fecha Alta.
- **Táctico**: Categoría, Equipo, Posiciones (Multiselección neón), Estatus (Activo, Lesionado, Ausencia).
- **Protección**: Check de Menor de Edad + Matriz de Tutor Legal (Nombre, Apellidos, Teléfono, Mail).

### 3.2. Ajustes de Interfaz (Fixes)
- **Visibilidad Temporal**: Uso de `[color-scheme:dark]` en inputs de fecha para ver el icono del calendario.
- **Corrección de Clipping**: Padding derecho `pr-10` en selectores de fecha para evitar recorte del icono por el radio de los bordes.

## 4. Micro-App: Pizarra Táctica (Tactical Board)

### 4.1. Motor de Partido (Match Board)
**Ubicación**: `src/app/board/match/page.tsx`
**Flujos de Trabajo**:
- **Sustitución por Arrastre (Drag & Drop)**: Arrastrar un "Suplente" sobre un "Titular" en la lista lateral ejecuta un `swap` de identidad en el campo y el roster.
- **Marcador Compacto**: Tipografía reducida (`text-base` / `text-xl`) optimizada para tablets y pantallas táctiles.
- **Basculación Táctica**: Controles de desplazamiento lateral (Izq, Centro, Der) por equipo.

## 5. Protocolos de Seguridad y Acceso

### 5.1. Protocolo_Elite (Superadmin Bypass)
**Ubicación**: `firestore.rules` y `src/lib/auth-context.tsx`
- **Bypass Directo**: Acceso total para correos autorizados (`munozmartinez.ismael@gmail.com`, `synqaisports@gmail.com`).
- **Jerarquía de Mando**: Matriz de roles con rangos numéricos para impedir que un rango inferior gestione a un superior.

---
*Este Ledger debe ser actualizado con cada nueva definición de esquema o flujo crítico.*