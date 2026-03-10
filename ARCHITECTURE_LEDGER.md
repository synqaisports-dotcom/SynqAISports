
# SynqSports Pro - Architecture Ledger v1.3 (Full System Sync)

Este documento es el registro maestro inmutable de la arquitectura técnica, protocolos de seguridad y flujos de trabajo de SynqSports Pro. Sirve como punto de verdad para la reconstrucción y auditoría del sistema.

## 1. Seguridad y Protocolos de Acceso

### 1.1. Protocolo_Elite (Superadmin Bypass)
- **Emails Autorizados**: `munozmartinez.ismael@gmail.com`, `synqaisports@gmail.com`, `admin@synqai.sports`.
- **Lógica de Bypass**: Implementada en `firestore.rules` y `auth-context.tsx`. Permite visibilidad total sobre todos los clubes y usuarios de la red para tareas de soporte y mantenimiento global.
- **Acceso Directo**: Los correos autorizados pueden saltar el túnel de onboarding y acceder directamente al Núcleo Global (`/admin-global`).

### 1.2. Matriz Jerárquica de Mandos
Los roles operan bajo un sistema de ranking numérico (`rank`) que impide la gestión de perfiles de rango superior o igual:
1. **superadmin** (100): Autoridad raíz.
2. **club_admin** (90): Responsable máximo del nodo local.
3. **academy_director** (80): Dirección deportiva.
4. **methodology_director** (70): Estrategia formativa.
5. **stage_coordinator** (60): Coordinación de tramos.
6. **coach** (50): Entrenador de equipo.
7. **delegate** (40): Gestión administrativa de equipo.
8. **tutor** (30): Familia/Responsable legal.
9. **athlete** (20): Jugador/Atleta.

## 2. Mapa de Micro-Apps y Rutas

### 2.1. Núcleo de Control (Admin Global) - `/admin-global`
- **Analytics**: `/analytics" (Métricas de red).
- **Red de Clubes**: `/clubs` (Vincular y auditar nodos locales).
- **Suscripciones**: `/plans` (Configuración de precios y accesos).
- **Identidad**: `/roles` (Matriz de permisos).
- **Marketing**: `/promos" (Generación de Magic Links y QR).
- **Usuarios**: `/users` (Gestión de credenciales globales).

### 2.2. Terminal Operativa (Club/Coach) - `/dashboard`
- **Identidad de Club**: `/club` (Datos federativos y logo).
- **Cantera**: `/academy` (Vinculación de equipos y staff). Incluye visor de Roster de Jugadores sincronizado.
- **Activos**: `/instalaciones` (Gestión geométrica de campos).
- **Roster**: `/players` (Ficha técnica del atleta con dorsal y apodo).
- **Gestión de Mando**: `/admin` (Matriz de permisos local).
- **Personal**: `/staff` (Alta de entrenadores y coordinadores).

### 2.3. Estrategia Metodológica - `/dashboard/methodology`
- **Hoja de Ruta**: `/learning-items` (Items de aprendizaje).
- **Metas**: `/objectives` (Objetivos por etapa).
- **Planificación**: `/cycle-planner` (Macrociclo anual).
- **Lanzadores**: `/board-*` (Accesos rápidos a pizarras).

### 2.4. Micro-App: Tactical Board (Pizarras) - `/board`
- **Match Mode**: `/match` (Tiempo real con marcador y basculación).
- **Training Mode**: `/training` (Estudio de diseño IA).
- **Promo Mode**: `/promo` (Acceso limitado para leads).

## 3. Esquemas de Datos Maestros (Entities)

### 3.1. Entidad: Club
- `id`: String (NODE-XXXX).
- `name`: String (Mayúsculas).
- `sport`: Enum (Fútbol, Baloncesto, etc.).
- `plan`: Enum (PROMO_LINK, VOLUMEN_CORE, ENTERPRISE_SCALE).
- `status`: Enum (Active, Paused, Overdue).
- `teams`: Array de objetos con sufijo (A, B, C, D), tipo (F7, F11, Futsal) y staff técnico completo.

### 3.2. Entidad: Atleta
- `number`: String (Dorsal).
- `nickname`: String (Nombre deportivo).
- `position`: Array (Multi-selección táctica).
- `isMinor`: Boolean (Activa campos de Tutor Legal).
- `attendance`: String (Cálculo porcentual).

## 4. Lógica de Negocio y Suscripciones

### 4.1. Protocolo de Democratización (Precios)
- **Standard**: 1.00€ / niño al mes.
- **Volumen (Alianza)**: 0.85€ / niño (+400 atletas).
- **Enterprise (Federativa)**: 0.70€ / niño (+800 atletas).

### 4.2. Gestión de Espacios (Instalaciones)
- **Subdivisiones**: 1 (Único), 2 (Mitades), 4 (Cuadrantes).
- **Motor Geométrico (4K Ready)**: Todas las coordenadas de subdivisiones, zonas y puntos de dibujo se calculan y almacenan en **porcentajes (%)**. Esto garantiza una visualización perfecta y simétrica en cualquier soporte, desde dispositivos móviles hasta pantallas 4K, independientemente de la resolución nativa.
- **Horario de División**: Propiedades `divisionStartTime` y `divisionEndTime`. Define cuándo el campo se fragmenta en zonas en el selector de la Academia.

## 5. Protocolos de UI y Experiencia

- **Tipografía**: Headline (Space Grotesk), Body (Inter). Estilo NASA/Aeroespacial.
- **Colorimetría**: Emerald (Global), Cyan (Operativa), Amber (Metodológica).
- **Precisión**: Uso de `[color-scheme:dark]` y `pr-10` en campos de fecha para evitar clipping de iconos.
- **Interacción**: Drag & Drop nativo para sustituciones en Roster Lateral y pizarra táctica.

---
*Este Ledger es el único punto de verdad para la integridad del sistema SynqSports Pro.*
