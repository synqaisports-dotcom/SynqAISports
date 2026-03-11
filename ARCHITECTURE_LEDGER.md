
# SynqSports Pro - Architecture Ledger v6.0 (Unified Library & Validation Protocol)

Este documento es el registro maestro inmutable de la arquitectura técnica, protocolos de seguridad y flujos de trabajo de SynqSports Pro.

## 1. Seguridad y Protocolos de Acceso

### 1.1. Protocolo_Elite (Superadmin Bypass)
- **Emails Autorizados**: `munozmartinez.ismael@gmail.com`, `synqaisports@gmail.com`, `admin@synqai.sports`.
- **Lógica de Bypass**: Implementada en `firestore.rules` y `auth-context.tsx`. Permite visibilidad total sobre todos los clubes y usuarios de la red para auditoría global.

### 1.2. Matriz Jerárquica de Mandos
Los roles operan bajo un sistema de ranking numérico (`rank`) que determina la autoridad para emitir credenciales y validar cambios:
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
- **Analytics**: Métricas de red y carga de procesos.
- **Almacén Neural**: `/admin-global/exercises` (Data warehouse para entrenamiento IA).
- **Red de Clubes**: Gestión de nodos locales y suscripciones.
- **Usuarios**: Emisión de credenciales globales.

### 2.2. Terminal Operativa (Club/Coach) - `/dashboard`
- **Identidad de Club**: `/club` (Datos federativos y logo).
- **Planificación y Sesiones**: `/dashboard/sessions` (Espejo operativo para entrenadores).
- **Cuaderno de Campo**: `/dashboard/coach/library` (Biblioteca visual Opción A para entrenadores).
- **Cantera**: `/dashboard/academy` (Gestión de equipos y rosters).
- **Activos**: `/dashboard/instalaciones` (Gestión de campos con subdivisiones).

### 2.3. Estrategia Metodológica - `/dashboard/methodology`
- **Libro de Estilo**: `/methodology/exercise-library` (Biblioteca de rendimiento Opción B para directores).
- **Planificador Maestro**: `/methodology/session-planner` (Diseño de macrociclo y validación de cambios).
- **Objetivos Tácticos**: `/methodology/objectives` (Hoja de ruta por etapas).

## 3. Protocolos de Bibliotecas (v6.0)

### 3.1. Ecosistema de Datos en Tres Niveles
1. **Nivel 1 (Global)**: Recolección de datos anonimizados para el entrenamiento del modelo Gemini. Los ejercicios de todos los clubes fluyen aquí sin datos sensibles.
2. **Nivel 2 (Club)**: Definición del Libro de Estilo oficial. El Director de Metodología valida tareas y las asigna a etapas blindadas.
3. **Nivel 3 (Coach)**: Espacio de creación personal (Cuaderno de Campo) y sugerencia de variantes privadas.

### 3.2. Formatos de Visualización
- **Opción A (Grid)**: Tarjetas tácticas con previsualización gráfica, optimizadas para la consulta rápida del Entrenador.
- **Opción B (Table)**: Lista compacta de alta densidad para gestión masiva, optimizada para el Director de Metodología.

### 3.3. ADN del Ejercicio (Metadatos Críticos)
- `stage`: Determina la visibilidad en el buscador según la categoría del equipo.
- `dimension`: Clasificación técnica/táctica/física/psicológica.
- `status`: Diferenciación entre "Official" (Validado por el club) y "Coach_Draft" (Sugerencia o tarea privada).

## 4. Protocolo de Planificación y Validación (v5.1)

### 4.1. Estructura Tripartita de Sesión
Cada entrenamiento se divide en tres bloques obligatorios con gestión de tiempos:
1. **Calentamiento / Activación**
2. **Zona Central (Contenidos)**
3. **Vuelta a la Calma**

### 4.2. Protocolo de Validación (Lead-Time)
- **Soberanía**: El Director de Metodología tiene el control total sobre el diseño del macrociclo anual.
- **Espejo Operativo**: El Entrenador visualiza su plan pero no puede editarlo directamente.
- **Sugerencias**: El Entrenador puede proponer cambios ("Sugerir Cambio").
- **Bloqueo de Seguridad**: Las solicitudes de cambio se bloquean automáticamente si el entrenamiento está programado para dentro de menos de **7 días** (Lead-Time Protocol).

## 5. Blindaje de Etapa (Filtrado Inteligente)
- El sistema implementa un filtrado de biblioteca basado en la etapa del equipo seleccionado.
- Si el equipo es "Alevín", el buscador solo devuelve ejercicios etiquetados para "Alevín", evitando que un entrenador acceda a contenidos de alto rendimiento o de iniciación inapropiados.

## 6. Gestión de Espacios (Instalaciones)
- **Motor Geométrico**: Subdivisiones de campos (1, 2 o 4 zonas) calculadas en porcentajes para asegurar simetría en cualquier dispositivo.
- **Horarios de División**: Las subdivisiones pueden activarse solo en franjas horarias específicas.
