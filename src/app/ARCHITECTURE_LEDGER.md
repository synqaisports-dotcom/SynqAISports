
# SynqSports Pro - Architecture Ledger v6.0 (Unified System Protocol)

Este documento es el registro maestro inmutable de la arquitectura técnica, protocolos de seguridad y flujos de trabajo de SynqSports Pro. Se actualiza de forma incremental para reflejar la evolución del sistema.

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

## 2. Mapa de Micro-Apps y Rutas

### 2.1. Núcleo de Control (Admin Global) - `/admin-global`
- **Analytics**: Métricas de red y carga IA.
- **Almacén Neural**: `/admin-global/exercises` (Data warehouse para entrenamiento IA).
- **Red de Clubes**: Gestión de nodos locales y planes.
- **Factoría de Usuarios**: Emisión de credenciales y tokens.

### 2.2. Terminal Operativa (Club/Coach) - `/dashboard`
- **Identidad de Club**: `/club` (Datos federativos y logo).
- **Espejo de Sesiones**: `/sessions` (Vista operativa para entrenadores sincronizada con metodología).
- **Cuaderno de Campo**: `/dashboard/coach/library` (Biblioteca visual Opción A para entrenadores).
- **Cantera**: `/academy` (Vinculación de equipos, staff y visor de Roster).
- **Activos**: `/instalaciones` (Gestión de campos con subdivisiones horarias).

### 2.3. Estrategia Metodológica - `/dashboard/methodology`
- **Libro de Estilo**: `/methodology/exercise-library` (Biblioteca de rendimiento Opción B para directores).
- **Planificador Maestro**: `/methodology/session-planner` (Diseño de macrociclo y validación de cambios).
- **Objetivos Tácticos**: `/methodology/objectives` (Hoja de ruta por categorías).

## 3. Protocolos de Bibliotecas (v6.0)

### 3.1. Ecosistema de Datos en Tres Niveles
1. **Nivel 1 (Global)**: Recolección de datos anonimizados para el entrenamiento del modelo Gemini (Admin Global).
2. **Nivel 2 (Club)**: Definición del Libro de Estilo oficial. El Director valida y asigna tareas a etapas blindadas.
3. **Nivel 3 (Coach)**: Espacio de creación personal (Cuaderno de Campo) y sugerencia de variantes.

### 3.2. Formatos de Visualización
- **Opción A (Grid)**: Tarjetas tácticas con previsualización gráfica (Optimizado para Coach).
- **Opción B (Table)**: Lista compacta de alta densidad para gestión masiva (Optimizado para Director).

### 3.3. ADN del Ejercicio (Metadatos Obligatorios)
- `stage`: Crítico para el filtrado automático por categorías.
- `dimension`: Clasificación técnica/táctica/física.
- `status`: Diferenciación entre "Oficial" y "Draft_Coach".

## 4. Protocolo de Planificación y Validación (v5.1)

### 4.1. Estructura Tripartita de Sesión
Cada entrenamiento se divide en tres bloques con gestión de tiempos por sliders:
1. **Calentamiento / Activación**
2. **Zona Central (Contenidos)**
3. **Vuelta a la Calma**

### 4.2. Protocolo de Validación (Lead-Time)
- **Soberanía**: El Director de Metodología diseña el plan maestro.
- **Sugerencias**: El Entrenador puede proponer cambios desde su terminal espejo (`/sessions`).
- **Bloqueo por Proximidad**: Las solicitudes de cambio se bloquean automáticamente si faltan menos de **7 días** para la sesión (Lead-Time Protocol).

## 5. Gestión de Espacios (Instalaciones)
- **Subdivisiones**: 1 (Único), 2 (Mitades), 4 (Cuadrantes).
- **Motor Geométrico**: Coordenadas calculadas en porcentajes (%) para simetría total en cualquier dispositivo.
