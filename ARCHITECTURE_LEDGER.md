
# SynqSports Pro - ARCHITECTURE_LEDGER v6.0 (Master Protocol)

Este documento es el registro maestro inmutable de la arquitectura técnica, protocolos de seguridad y flujos de trabajo de SynqSports Pro. Se actualiza de forma incremental para reflejar la evolución del sistema.

## 1. Seguridad y Protocolos de Acceso

### 1.1. Protocolo_Elite (Superadmin Bypass)
- **Emails Autorizados**: `munozmartinez.ismael@gmail.com`, `synqaisports@gmail.com`, `admin@synqai.sports`.
- **Lógica de Bypass**: Implementada en `firestore.rules` y `auth-context.tsx`. Permite visibilidad total sobre todos los clubes y usuarios de la red para auditoría global y soporte técnico de nivel 1.

### 1.2. Matriz Jerárquica de Mandos (Ranking System)
Los roles operan bajo un sistema de ranking numérico (`rank`) que determina la autoridad para emitir credenciales y validar cambios:
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

## 3. Protocolos de Bibliotecas (v6.0)

### 3.1. Ecosistema de Datos en Tres Niveles
1. **Nivel 1 (Global)**: Recolección de datos técnicos anonimizados de todos los clubes para el entrenamiento del modelo Gemini.
2. **Nivel 2 (Club)**: El "Libro de Estilo". El Director de Metodología valida tareas y las asigna a etapas blindadas.
3. **Nivel 3 (Coach)**: "Cuaderno de Campo". Espacio privado de creación y consulta del manual oficial.

### 3.2. Formatos de Visualización Específicos
- **Opción A (Grid)**: Tarjetas tácticas con previsualización, optimizadas para el Entrenador.
- **Opción B (Table)**: Lista compacta de alta densidad para gestión masiva, optimizada para el Director de Metodología.

### 3.3. ADN del Ejercicio (Metadatos Críticos)
- `stage`: Crítico para el filtrado automático por categorías (Debutantes, Alevín, etc.).
- `dimension`: Clasificación técnica/táctica/física/psicológica.
- `status`: Diferenciación entre "Official" (Club) y "Coach_Draft" (Sugerencia).

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
- **Bloqueo de Seguridad**: Las solicitudes de cambio se bloquean automáticamente si faltan menos de **7 días** para la sesión para garantizar la preparación del staff.

## 5. Blindaje de Etapa (Filtrado Inteligente)
- El sistema implementa un filtrado de biblioteca basado en la etapa del equipo seleccionado.
- El buscador de sesiones solo devuelve ejercicios etiquetados para la etapa correspondiente (ej. un entrenador de Alevín no puede asignar por error tareas de Senior).

## 6. Gestión de Espacios (Instalaciones)
- **Motor Geométrico**: Subdivisiones de campos (1, 2 o 4 zonas) calculadas en porcentajes para asegurar simetría en cualquier dispositivo.
- **Horarios de División**: Las subdivisiones pueden activarse solo en franjas horarias específicas, optimizando el uso del suelo del club.

## 7. Stack Tecnológico y Calidad
- **Frontend**: Next.js 15 (App Router) + TypeScript.
- **UI/UX**: Tailwind CSS + ShadCN UI + Lucide Icons.
- **Motores IA**: Genkit + Google Gemini 1.5 Flash.
- **Persistencia**: Firebase Auth + Firestore.
- **Scroll Táctico**: Barras de desplazamiento siempre visibles en áreas críticas con efecto Glow reactivo.
