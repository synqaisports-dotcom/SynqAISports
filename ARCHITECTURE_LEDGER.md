
# SynqSports Pro - ARCHITECTURE_LEDGER v8.1.0 (Estación de Trabajo Ergonómica)

Este documento es el registro maestro inmutable de la arquitectura técnica, protocolos de seguridad y flujos de trabajo de SynqSports Pro.

## 1. Seguridad y Protocolos de Acceso

### 1.1. Protocolo_Elite (Superadmin Bypass)
- **Emails Autorizados**: `munozmartinez.ismael@gmail.com`, `synqaisports@gmail.com`, `admin@synqai.sports`.
- **Lógica de Bypass**: Implementada en `firestore.rules` y `auth-context.tsx`. Permite visibilidad total sobre todos los clubes y usuarios de la red para auditoría global y soporte técnico.

### 1.2. Matriz Jerárquica de Mandos (Ranking System)
Los roles operan bajo un sistema de ranking numérico (`rank`) que determina la autoridad:
1. **superadmin** (100) - Autoridad raíz.
2. **club_admin** (90) - Gestión total del nodo local.
3. **academy_director** (80) - Dirección de cantera.
4. **methodology_director** (70) - Soberanía técnica y de sesiones.
5. **stage_coordinator** (60) - Gestión de categorías específicas.
6. **coach** (50) - Operativa de campo y sugerencias.
7. **delegate** (40) - Auxiliar de campo.
8. **tutor** (30) - Consultoría de atletas.
9. **athlete** (20) - Telemetría y visor personal.

## 2. Mapa de Micro-Apps y Rutas

### 2.1. Núcleo de Control (Admin Global) - `/admin-global`
- **Analytics**: Métricas de red, ingresos y carga de procesos IA.
- **Almacén Neural**: `/admin-global/exercises` (Data warehouse anonimizado para entrenamiento IA).
- **Red de Clubes**: Gestión de nodos locales, planes de suscripción y estatus de red.
- **Factoría de Usuarios**: Emisión de credenciales globales y gestión de Magic Links.

### 2.2. Terminal Operativa (Club/Coach) - `/dashboard`
- **Identidad de Club**: `/club` (Datos federativos, sociales y escudo).
- **Espejo Operativo**: `/sessions` (Vista bloqueada para entrenadores sincronizada con metodología).
- **Cuaderno de Campo**: `/dashboard/coach/library` (Biblioteca visual Opción A para entrenadores).
- **Cantera**: `/academy` (Gestión de equipos, staff y visor de Roster).
- **Activos**: `/instalaciones` (Gestión de campos con subdivisiones horarias).

### 2.3. Estrategia Metodológica - `/dashboard/methodology`
- **Libro de Estilo**: `/methodology/exercise-library` (Biblioteca de rendimiento Opción B para directores).
- **Planificador Maestro**: `/methodology/session-planner` (Diseño de macrociclo y validación de cambios).
- **Objetivos Tácticos**: `/methodology/objectives` (Hoja de ruta por categorías).

## 3. Protocolos de Bibliotecas (v6.5)

### 3.1. Ecosistema de Datos en Tres Niveles
1. **Nivel 1 (Global)**: Recolección de datos técnicos anonimizados para entrenamiento IA en el Almacén Neural.
2. **Nivel 2 (Club)**: El "Libro de Estilo". Tareas Maestras validadas asignadas a etapas blindadas. Formato Tabla (Opción B).
3. **Nivel 3 (Coach)**: "Cuaderno de Campo". Espacio privado de creación. Formato Grid (Opción A).

### 3.2. ADN del Ejercicio (Metadatos Críticos v6.2)
Las tareas maestras ahora incluyen una matriz de datos enriquecida para máxima precisión metodológica:
- `didactic_strategy`: Tipo de juego o metodología aplicada.
- `objectives`: Metas técnicas y tácticas concretas.
- `conditional_content`: Capacidades físicas implicadas (ej. Coordinación).
- `metrics`: Tiempo, Espacio y Situación de Juego.
- `tactical_dna`: Acción técnica, Acción táctica e Intención colectiva.
- `operational_rules`: Descripción, Normas de provocación, Consignas y Material.

## 4. Protocolo de Planificación y Validación (v5.1)

### 4.1. Estructura Tripartita de Sesión
Cada entrenamiento se divide en tres bloques con gestión de tiempos configurables:
1. **Calentamiento / Activación**
2. **Zona Central (Contenidos)** - Soporta múltiples ejercicios.
3. **Vuelta a la Calma**

### 4.2. Protocolo de Validación (Lead-Time Protocol)
- **Soberanía**: El Director de Metodología diseña el macrociclo (septiembre-junio).
- **Espejo**: El Entrenador visualiza su plan pero no puede editarlo directamente.
- **Sugerencias**: El Entrenador puede proponer cambios ("Sugerir Cambio").
- **Bloqueo de Seguridad**: Las solicitudes de cambio se bloquean automáticamente si faltan menos de **7 días** para la sesión.

## 5. Protocolo de Pizarra y Dibujo (v8.1.0)

### 5.1. Motor de Dibujo Suavizado
- Uso de lógica de interpolación para trazos fluidos en el Canvas e independencia de resolución.

### 5.2. Esquema JSON Maestro (Independencia de Dispositivo)
- **Coordenadas Decimales**: Todas las posiciones de fichas y trazos se guardan como valores de `0.000` a `1.000`. Garantiza fidelidad visual en cualquier dispositivo.

### 5.3. Herramientas de Dibujo Avanzadas (v8.1.0)
- **Modos de Trazo**: Dibujo Libre, Rectángulos, Círculos, Ondas Sinusoidales, Flechas simples y dobles.
- **Motor de Ondas (v7.7.1)**: Implementación de algoritmo sinusoidal para representar movimientos de agilidad y fintas fluidas entre dos puntos.
- **Manipulación Táctica Total**: 
    - **Arrastre (Dragging)**: Capacidad de mover cualquier elemento por el campo manteniendo su escala.
    - **Puntos de Modificación**: Implementación de 4 handles en rectángulos y puntos extremos en flechas/círculos/ondas para redimensionado dinámico.
    - **Smart Selection (v7.1)**: El sistema detecta clics sobre formas existentes incluso si hay otra herramienta activa.
- **Estación de Trabajo Ergonómica (v8.1.0)**:
    - **Doble Barra Horizontal**: Distribución simétrica en la parte inferior del campo. Lado izquierdo para Biblioteca de Materiales y lado derecho para Herramientas de Dibujo.
    - **Modo Colapsable Independiente**: Ambas barras pueden minimizarse para maximizar el área de visión táctica.
    - **Blindaje Visual**: Bordes reforzados y efecto de resplandor (glow) en ambas estaciones de control.
- **Lógica de Controles Específica (v7.8.0)**:
    - **Círculos**: Se omite el nodo de rotación.
    - **Dibujo Libre Blindado**: Se eliminan las acciones (menú de propiedades) para los trazos manuales. Una vez finalizados, actúan como bloques tácticos puros que solo permiten selección y arrastre.
- **Análisis Espacial (v7.3.1)**:
    - **Carriles Tácticos**: Líneas horizontales al **20%** y **80%** de la altura para alineación con el área grande.

## 6. Gestión de Espacios e Instalaciones
- **Motor Geométrico**: Subdivisiones de campos (1, 2 o 4 zonas) calculadas en porcentajes.
- **Horarios de División**: Las subdivisiones pueden activarse solo en franjas horarias específicas.

## 7. Persistencia y Promo Hook
- **Magic Links**: Detección de tokens en URL (`?token=...`).
- **Persistence Layer**: Uso de `localStorage` para el estado de sesión y onboarding.

## 8. UX y Calidad Visual
- **Glow Reactivo**: Efectos de resplandor neón en elementos activos.
- **Scroll Táctico**: Barras de desplazamiento siempre visibles con el color de identidad del club.
