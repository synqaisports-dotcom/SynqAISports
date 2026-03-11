
# SynqSports Pro - Architecture Ledger v6.0 (Unified Library Protocol)

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

## 2. Mapa de Micro-Apps y Rutas

### 2.1. Núcleo de Control (Admin Global) - `/admin-global`
- **Analytics**: Métricas de red.
- **Almacén Neural**: `/admin-global/exercises` (Data warehouse para entrenamiento IA).
- **Red de Clubes**: Gestión de nodos locales.
- **Suscripciones**: Configuración de protocolos de precio (1€ - 0.70€).
- **Usuarios**: Emisión de credenciales.

### 2.2. Terminal Operativa (Club/Coach) - `/dashboard`
- **Identidad de Club**: `/club` (Datos federativos y logo).
- **Planificación y Sesiones**: `/sessions` (Espejo operativo para entrenadores).
- **Cuaderno de Campo**: `/dashboard/coach/library` (Biblioteca visual Opción A para entrenadores).
- **Cantera**: `/academy` (Vinculación de equipos, staff y visor de Roster).
- **Activos**: `/instalaciones` (Gestión de campos con subdivisiones horarias).

### 2.3. Estrategia Metodológica - `/dashboard/methodology`
- **Libro de Estilo**: `/methodology/exercise-library` (Biblioteca de rendimiento Opción B para directores).
- **Planificador Maestro**: `/methodology/session-planner` (Diseño de macrociclo y validación).

## 3. Protocolos de Bibliotecas (v6.0)

### 3.1. Ecosistema de Datos en Tres Niveles
1. **Nivel 1 (Global)**: Recolección de datos anonimizados para el entrenamiento del modelo Gemini.
2. **Nivel 2 (Club)**: Definición del Libro de Estilo oficial. El Director asigna tareas a etapas blindadas.
3. **Nivel 3 (Coach)**: Espacio de creación personal y sugerencia de variantes.

### 3.2. Formatos de Visualización
- **Opción A (Grid)**: Tarjetas tácticas con previsualización gráfica (Coach).
- **Opción B (Table)**: Lista compacta de alta densidad para gestión masiva (Director).

### 3.3. ADN del Ejercicio (Metadatos Obligatorios)
- `stage`: Crítico para el filtrado en el Planificador de Sesiones.
- `dimension`: Clasificación técnica/táctica/física.
- `status`: Diferenciación entre "Oficial" y "Draft_Coach".

## 4. Gestión de Espacios (Instalaciones)
- **Subdivisiones**: 1 (Único), 2 (Mitades), 4 (Cuadrantes).
- **Motor Geométrico**: Coordenadas calculadas en porcentajes (%) para simetría total.

## 5. Protocolo de Planificación Operativa (v4.4)
- **Matriz Maestro**: Visualización horizontal de septiembre a junio.
- **Estructura Tripartita**: Calentamiento, Zona Central y Vuelta a la Calma con gestión de tiempos por sliders.
- **Validación de Cambios**: Los entrenadores sugieren, el Director valida. Bloqueo por lead-time de 7 días.
