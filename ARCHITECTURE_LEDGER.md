
# SynqSports Pro - Architecture Ledger v2.8 (Full Sync Protocol)

Este documento es el registro maestro inmutable de la arquitectura técnica, protocolos de seguridad y flujos de trabajo de SynqSports Pro.

## 1. Seguridad y Protocolos de Acceso

### 1.1. Protocolo_Elite (Superadmin Bypass)
- **Emails Autorizados**: `munozmartinez.ismael@gmail.com`, `synqaisports@gmail.com`, `admin@synqai.sports`.
- **Lógica de Bypass**: Implementada en `firestore.rules` y `auth-context.tsx`. Permite visibilidad total sobre todos los clubes y usuarios de la red.

### 1.2. Matriz Jerárquica de Mandos
Los roles operan bajo un sistema de ranking numérico (`rank`):
1. **superadmin** (100)
2. **club_admin** (90)
3. **academy_director** (80)
4. **methodology_director** (70)
5. **stage_coordinator** (60)
6. **coach** (50)
7. **delegate** (40)
8. **tutor** (30)
9. **athlete** (20)

**Orden de Asignación en Equipos**: Coordinador de Etapa, Entrenador, Segundo Entrenador, Delegado, Preparador Físico.

## 2. Mapa de Micro-Apps y Rutas

### 2.1. Núcleo de Control (Admin Global) - `/admin-global`
- **Analytics**: Métricas de red.
- **Red de Clubes**: Gestión de nodos locales.
- **Suscripciones**: Configuración de protocolos de precio (1€ - 0.70€).
- **Usuarios**: Emisión de credenciales.

### 2.2. Terminal Operativa (Club/Coach) - `/dashboard`
- **Identidad de Club**: `/club` (Datos federativos y logo).
- **Cantera**: `/academy` (Vinculación de equipos, staff y visor de Roster sincronizado).
- **Activos**: `/instalaciones` (Gestión de campos con subdivisiones horarias).
- **Roster**: `/players` (Ficha técnica con dorsal, apodo y control de menores).

## 3. Esquemas de Datos Maestros (Entities)

### 3.1. Entidad: Club / Equipo
- `id`: String (NODE-XXXX).
- `type`: Enum (F7, F11, Futsal). Determina dimensiones de campo.
- `suffix`: Letra identificativa (A, B, C, D).
- `staff`: Objeto con 5 roles técnicos obligatorios.
- `status`: Enum (Active, Paused).

### 3.2. Entidad: Atleta
- `number`: String (Dorsal).
- `nickname`: String (Nombre deportivo).
- `isMinor`: Activa protocolo de Tutor Legal.

## 4. Lógica de Negocio y Geometría

### 4.1. Protocolo de Democratización
- Precios escalados según volumen de atletas (Standard 1.00€, Alianza 0.85€, Enterprise 0.70€).

### 4.2. Gestión de Espacios (Instalaciones)
- **Subdivisiones**: 1 (Único), 2 (Mitades), 4 (Cuadrantes).
- **Motor Geométrico (4K Ready)**: Coordenadas calculadas en **porcentajes (%)** para simetría total en cualquier resolución.
- **Horario de División**: Propiedades `divisionStartTime` y `divisionEndTime` para fragmentación temporal del activo.

## 5. Protocolos de UI y Estabilidad
- **Notificaciones**: Las llamadas a `toast()` deben ejecutarse fuera de los actualizadores de estado para evitar colisiones de renderizado.
- **Precisión**: Uso de `pr-10` en inputs de fecha para evitar clipping de iconos nativos en bordes redondeados.

## 6. Estrategia de Captación (Promo Hook)

### 6.1. Protocolo de Usuario sin Nodo
- **Casuística**: Entrenadores que acceden vía Promo Board o sin Club asignado.
- **Micro-App de Partido**: En ausencia de `clubId`, la terminal oculta el selector de red y el visor de Roster centralizado.
- **Factoría Local**: Habilita un nodo de "Creación de Equipo Local" que permite definir Nombre, Siglas y Formato (F11, F7, Futsal).
- **Persistencia**: Los datos se guardan en el `localStorage` del dispositivo, actuando como un activo local persistentente para el entrenador invitado.

## 7. Protocolo de Pizarra y Dibujo

### 7.1. Motor de Dibujo Fluido (Especialización)
- **Terminal de Partido (Exclusiva)**: Protocolo de **Rotulador Fluido**. Herramientas simplificadas (Pincel, Color, Limpiar).
- **Modo Pintura (Lock Down)**: Al activar el dibujo en partido, se bloquea el `pointer-events` de los jugadores para evitar desplazamientos accidentales durante la explicación táctica.
- **Terminales de Diseño (Entrenamiento/Promo)**: Protocolo de **Diseño Geométrico**. Incluye flechas, formas y material técnico adicional.

## 8. Rendimiento y Experiencia de Usuario (UX)

### 8.1. Zero-Latency Touch System
- **Arraste de Fichas**: Se desactivan las transiciones CSS (`transition: none`) durante el estado de arrastre (`isDragging`) para eliminar el desfase entre el dedo y el objeto.
- **Captura de Puntero**: Uso obligatorio de `setPointerCapture` en eventos de inicio de arrastre para garantizar la continuidad del movimiento en tablets aunque el dedo salga de los límites del componente.
- **Touch-Action Lockdown**: Propiedad `touch-action: none` aplicada en contenedores tácticos para evitar interferencias del scroll nativo del navegador.

### 8.2. Protocolo de Sincronización de Contenedores (v1.9)
- **Precisión de Arrastre**: La referencia de captura de coordenadas (`fieldRef`) debe asignarse estrictamente al contenedor geométrico interno que define el área de juego (el que tiene la relación de aspecto y el `relative`).
- **Eliminación de Offset**: Al sincronizar el cálculo de `clientX/Y` con el `getBoundingClientRect` del contenedor interno, se garantiza una relación 1:1, eliminando la distancia entre el puntero y el centro de la ficha.

## 9. Registro de Ajustes y Correcciones (Hotfixes)

### 9.1. Protocolo de Cobertura de Lienzo (Drawing Layer v2.0)
- **Resolución**: Implementación de un `ResizeObserver` vinculado al contenedor del campo para sincronizar en tiempo real el `width` y `height` interno del canvas con el tamaño renderizado del componente.

### 9.2. Protocolo de Ergonomía Táctica (v2.1)
- **Ajuste**: El botón de acceso al Roster/Configuración se desplaza de la cabecera a la **esquina inferior derecha** del campo.
- **Ajuste**: El botón de Pantalla Completa se desplaza de la cabecera a la **esquina inferior izquierda** del campo.
- **Racional**: Optimización para el uso con pulgares en tablets y liberación de carga visual en el marcador superior. Simetría funcional.

## 10. Protocolo de Objetivos Metodológicos (v2.8)

### 10.1. Estructura de Desarrollo por Etapas
- **Nodo Piloto**: Debutantes (5-7 años). Iniciación integral y lúdica.
- **Nodo Expansión**: Prebenjamín (6-8 años). Cooperación inicial y dominio del balón.
- **Nodo Especialización Inicial**: Benjamín (8-10 años). Iniciación específica técnica y táctica.
- **Nodo Transición Táctica**: Alevín (10-12 años). Consolidación técnica y paso a F11.
- **Nodo Competición Inicial**: Infantil (11-13 años). Edad de oro del aprendizaje motor.
- **Nodo Rendimiento**: Cadete (14-15 años). Especialización por puesto y mentalidad competitiva.
- **Nodo Pre-Profesional**: Juvenil (16-18 años). Optimización del rendimiento y salto a Senior.
- **Dimensiones de Objetivos**: 
  1. **Filosofía**: ADN de la etapa.
  2. **Técnicos**: Perfeccionamiento gestual y por puesto.
  3. **Tácticos**: Inteligencia de juego, estrategia y reglamento.
  4. **Motores/Físicos**: Rendimiento condicional y hábitos saludables (Entrenamiento Invisible).
  5. **Psicopedagógicos**: Las "4 C" (Confianza, Control, Compromiso, Concentración).
- **Visualización**: Uso de tarjetas modulares en el `methodology-theme` (ámbar) para diferenciar el contenido académico del operativo.
