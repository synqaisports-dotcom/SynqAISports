
# SynqSports Pro - ARCHITECTURE_LEDGER v9.22.2 (Edición Estratégica)

Este documento es el registro maestro inmutable de la arquitectura técnica, protocolos de seguridad y flujos de trabajo de SynqSports Pro. Es el ADN del proyecto y debe preservarse íntegramente en cada iteración.

## 1. Cimientos y Núcleo (v1.0 - v2.5)
- **v1.0.0**: Arquitectura base en Next.js 15 (App Router), TypeScript y Tailwind CSS.
- **v1.2.0**: Integración de Firebase Auth y Firestore (Estructura NoSQL para multi-tenant).
- **v1.5.0**: **PROTOCOLO_ÉLITE**: Implementación de blindaje por email en `firestore.rules` para accesos raíz: `munozmartinez.ismael@gmail.com` y `synqaisports@gmail.com`. Garantiza bypass administrativo total.
- **v2.0.0**: Sistema de Sidebars dinámicos y navegación por roles (Superadmin, Coach, Admin). Temas diferenciados por sector (Cyan, Amber, Emerald).
- **v2.5.0**: Implementación de ShadCN UI para componentes de alta fidelidad y protocolos de carga (Glassmorphism).

## 2. Gestión Operativa y Datos (v3.0 - v5.0)
- **v3.0.0**: Módulos maestros de Club, Staff, Cantera y Jugadores con validación Zod.
- **v3.5.0**: **PROTOCOLO_PERSISTENCIA**: Implementación de guardado en `localStorage` para datos globales del prototipo (Clubs, Users, Logs) asegurando integridad entre sesiones antes de la migración final a Firestore.
- **v4.0.0**: Terminal de Instalaciones con gestión de subdivisiones horizontales y horarios inteligentes.
- **v5.0.0**: Suite Metodológica: Objetivos por etapas (desde Debutantes hasta Juvenil) y Planificador de Ciclos.

## 3. Inteligencia Artificial y Red Global (v6.0 - v8.5)
- **v6.0.0**: Integración de Genkit + Google Gemini 1.5 Flash para generación de planes tácticos y ejercicios individuales.
- **v7.0.0**: Protocolo Visual "Neural": Efectos de escaneo, gradientes dinámicos y scan-lines de identidad.
- **v8.0.0**: Núcleo Global (Superadmin) para gestión de red de clubes, planes de suscripción y facturación masiva.
- **v8.5.0**: Sistema de Magic Links y QR con marca de agua para captación regional automatizada.

## 4. Evolución del Motor Táctico (v9.0 - v9.3)
- **v9.1.0**: Implementación de Multiselección (Shift+Click) y Capas (Z-Index) para evitar solapamientos.
- **v9.2.0**: Cruz de Movimiento Avanzada y Herramienta de Texto Táctico.
- **v9.3.0**: Integración de Slider de Opacidad y estilos de línea (Sólida/Dashed) en tiempo real.

## 5. Protocolo de Pizarra y Dibujo (v9.4.0 - v9.8.7)
- **v9.4.0**: **Independencia de Resolución**: Migración a Coordenadas Decimales (0.000 a 1.000) para paridad total entre Mobile, Tablet y 4K.
- **v9.5.0**: **Motor Bezier**: Nodos de control azules para curvatura dinámica en flechas y trayectorias.
- **v9.7.5**: **Blindaje de Texto**: Hitbox expandida y renderizado forzado en capa superior absoluta para facilitar la selección y edición.
- **v9.8.0**: **Live Toolbar Input**: Integración de campo de texto en cabecera para edición directa de consignas sin diálogos externos.
- **v9.8.1**: **Geometría Circular**: Forzado de relación de aspecto 1:1 en píxeles para jugadores y círculos, eliminando distorsiones ovaladas.
- **v9.8.2**: **Inteligencia de Dorsales**: Autoincremento secuencial (n+1) al duplicar atletas.
- **v9.8.5**: **Blindaje de Interacción**: Fix definitivo a `ReferenceError: maxY is not defined` en el escalado de objetos.
- **v9.8.6**: **Sincronización de Materiales**: Paridad visual total entre Pizarra Promo y Profesional (sombras y texturas).
- **v9.8.7**: **Unificación Funcional**: Activación de Carriles Tácticos en modo Promo y eliminación de restricciones visuales de capacidad.

## 6. Auditoría y Estrategia de Captación (v9.9.0 - v9.10.1)
- **v9.9.0**: Auditoría integral completada. Blindaje de protocolos Superadmin verificado.
- **v9.10.0**: **PROTOCOLO_CAPTACIÓN**: 
    - Implementación de Registro Email/Password obligatorio para todos los niveles (Free/Pro).
    - Sandbox Promo: Límite de 20 ejercicios (4 Calentamientos, 12 Partes Principales, 4 Vueltas a la Calma) y 4 Sesiones.
    - Ads Integration: Incorporación de placeholders de publicidad no intrusiva en terminales Promo.
- **v9.10.1**: **Estabilidad de Iconos**: Corrección de importación de `lucide-react`.

## 7. Modelo de Negocio y Blindaje Estratégico (v9.11.0 - v9.18.0)
- **v9.11.0**: **PROTOCOLO_NEGOCIO_DUAL**:
    - **Modelo Dual-Surcharge**: Estructura de 12€ (SynqAI) + 12€ (Margen Club) por atleta/año.
    - **Revenue Share 60/40**: Reparto de ingresos publicitarios.
    - **Blindaje Superadmin**: Acceso total para `munozmartinez.ismael@gmail.com`.
- **v9.12.0**: **CEPO_DE_DATOS_ABSOLUTO**:
    - Requisito técnico obligatorio de `Tutor_Email` en cada ficha de jugador, independientemente de la edad o el rol. 
    - Garantiza la integridad del inventario publicitario y el despliegue futuro de las Apps de Tutor y Jugador.
- **v9.13.0**: **PROTOCOLO_SINCRONIZACIÓN_PERIFÉRICA**:
    - Implementación del "Watch Synchronization Hub" en la Pizarra de Partido.
- **v9.14.0**: **PROTOCOLO_TELEMETRÍA_CONFIGURABLE**:
    - Implementación de la terminal de configuración de alertas de Smartwatch (`/dashboard/watch-config`).
- **v9.15.0**: **PROTOCOLO_TIEMPO_SINCRO**:
    - Establecimiento de la Pizarra de Partido como "Master Time Server". 
- **v9.16.0**: **PROTOCOLO_INTERVALOS_SINCRO**:
    - Implementación de intervalos de aviso de cambio programables (5m, 8m, Mitad de tiempo).
- **v9.17.0**: **PROTOCOLO_POCKET_MASTER**:
    - Definición del Smartphone como nodo de redundancia para telemetría y tiempo.
- **v9.18.0**: **INTERFAZ_POCKET_REDUNDANTE**:
    - Implementación de la vista `MatchPocketController` para móviles.

## 8. Accesibilidad y Navegación Universal (v9.19.0 - v9.19.3)
- **v9.19.0**: **PROTOCOL_MOBILE_NAV**: MobileHeaders y SidebarTriggers visibles en táctil.
- **v9.19.1**: **STABILITY_PATCH_POCKET**: Corrección de referencias en la vista Pocket.
- **v9.19.2**: **PROTOCOL_PORTAL_RESILIENCE**: Control de hidratación y estabilidad de Radix Portals.
- **v9.19.3**: **ACCESSIBILITY_REINFORCEMENT**: Eliminación de errores de consola de Radix UI mediante `sr-only` titles.

## 9. Ecosistema de Hardware Inteligente (v9.20.0 - v9.22.2)
- **v9.20.0**: **PROTOCOL_SMARTWATCH_PWA**: Micro-app Smartwatch en `/smartwatch` con diseño circular.
- **v9.20.1**: **PROTOCOL_DEEP_NIGHT_REFINE**: Sincronización cromática y optimización "Fat Finger".
- **v9.21.0**: **PROTOCOL_TAP_TO_SUB**: Implementación de sustitución en 2 pasos (OUT/IN).
- **v9.22.0**: **PROTOCOL_UNIFIED_SUB_POCKET**: Extensión del protocolo Tap-to-Sub al Pocket Master (Móvil).
- **v9.22.1**: **PROTOCOL_WATCH_ERGONOMICS**: Redimensionamiento del botón de sustitución para evitar desbordamientos en la curvatura inferior.
- **v9.22.2**: **PROTOCOL_WATCH_DIAL_ADJUST**: Ajuste de padding en cabeceras de sub-vistas para evitar recorte de botones en pantallas circulares.
