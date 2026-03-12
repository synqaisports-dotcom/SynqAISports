
# SynqSports Pro - ARCHITECTURE_LEDGER v9.9.0 (Edición Maestra de Auditoría)

Este documento es el registro maestro inmutable de la arquitectura técnica, protocolos de seguridad y flujos de trabajo de SynqSports Pro. Es el ADN del proyecto y debe preservarse íntegramente en cada iteración.

## 1. Cimientos y Núcleo (v1.0 - v2.5)
- **v1.0.0**: Arquitectura base en Next.js 15 (App Router), TypeScript y Tailwind CSS.
- **v1.2.0**: Integración de Firebase Auth y Firestore (Estructura NoSQL para multi-tenant).
- **v1.5.0**: **PROTOCOLO_ÉLITE**: Implementación de blindaje por email en `firestore.rules` para accesos raíz: `munozmartinez.ismael@gmail.com` y `synqaisports@gmail.com`.
- **v2.0.0**: Sistema de Sidebars dinámicos y navegación por roles (Superadmin, Coach, Admin). Temas diferenciados por sector (Cyan, Amber, Emerald).
- **v2.5.0**: Implementación de ShadCN UI para componentes de alta fidelidad y protocolos de carga (Glassmorphism).

## 2. Gestión Operativa y Datos (v3.0 - v5.0)
- **v3.0.0**: Módulos maestros de Club, Staff, Cantera y Jugadores con validación Zod.
- **v3.5.0**: **PROTOCOLO_PERSISTENCIA**: Implementación de guardado en `localStorage` para datos globales del prototipo (Clubs, Users, Logs) asegurando integridad entre sesiones.
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
- **v9.7.5**: **Blindaje de Texto**: Hitbox expandida y renderizado forzado en capa superior absoluta para facilitar la edición.
- **v9.8.0**: **Live Toolbar Input**: Integración de campo de texto en cabecera para edición directa de consignas sin diálogos externos.
- **v9.8.1**: **Geometría Circular**: Forzado de relación de aspecto 1:1 en píxeles para jugadores y círculos, eliminando distorsiones ovaladas.
- **v9.8.2**: **Inteligencia de Dorsales**: Autoincremento secuencial (n+1) al duplicar atletas.
- **v9.8.6**: **Sincronización de Materiales**: Portado del motor de alta fidelidad (sombras y patrones) a la Pizarra Promo.
- **v9.8.7**: **Unificación Funcional**: Activación de Carriles Tácticos en modo Promo y eliminación de restricciones visuales de capacidad.

## 6. Auditoría de Estado Actual (v9.9.0)
- **Seguridad**: Reglas de Firestore verificadas. Acceso Superadmin blindado.
- **Formularios**: Mapeo de campos de alta técnica completado en Biblioteca y Academy.
- **Memoria**: Sincronización total del historial de versiones en todos los nodos de documentación.
