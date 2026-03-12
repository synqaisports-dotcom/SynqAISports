
# SynqSports Pro - ARCHITECTURE_LEDGER v9.9.0 (Edición Maestra de Auditoría)

Este documento es el registro maestro inmutable de la arquitectura técnica, protocolos de seguridad y flujos de trabajo de SynqSports Pro.

## 1. Cimientos y Núcleo (v1.0 - v2.5)
- **v1.0.0**: Arquitectura base en Next.js 15 (App Router), TypeScript y Tailwind CSS.
- **v1.2.0**: Integración de Firebase Auth y Firestore (Estructura NoSQL para multi-tenant).
- **v1.5.0**: **PROTOCOLO_ÉLITE**: Blindaje por email en `firestore.rules` para accesos raíz: `munozmartinez.ismael@gmail.com` y `synqaisports@gmail.com`.
- **v2.0.0**: Sistema de Sidebars dinámicos y navegación por roles (Superadmin, Coach, Admin).
- **v2.5.0**: Implementación de ShadCN UI para componentes de alta fidelidad.

## 2. Gestión Operativa y Datos (v3.0 - v5.0)
- **v3.0.0**: Módulos maestros de Club, Staff, Cantera y Jugadores con validación Zod.
- **v3.5.0**: **PERSISTENCIA_HÍBRIDA**: Uso de `localStorage` para mantener la integridad del prototipo (Nodos de Club y Usuarios).
- **v4.0.0**: Terminal de Instalaciones con gestión de subdivisiones y horarios.
- **v5.0.0**: Suite Metodológica: Objetivos por etapas y Planificador de Ciclos.

## 3. Inteligencia Artificial y Sincronización (v6.0 - v8.5)
- **v6.0.0**: Integración de Genkit + Google Gemini 1.5 Flash para generación de planes y ejercicios.
- **v7.0.0**: Protocolo Visual "Neural": Glassmorphism, efectos de escaneo y temas diferenciados (Cyan, Amber, Emerald).
- **v8.0.0**: Núcleo Global (Superadmin) para gestión de red de clubes y facturación.
- **v8.5.0**: Sistema de Magic Links y QR para captación regional automatizada.

## 4. Evolución del Motor Táctico (v9.0 - v9.3)
- **v9.1.0**: Implementación de Multiselección (Shift+Click) y Capas (Z-Index).
- **v9.2.0**: Cruz de Movimiento Avanzada y Herramienta de Texto Táctico.
- **v9.3.0**: Integración de Slider de Opacidad y estilos de línea (Sólida/Dashed).

## 5. Protocolo de Pizarra y Dibujo (v9.4.0 - v9.8.7)
- **v9.4.0**: Coordenadas Decimales (0.000 a 1.000) para independencia de resolución.
- **v9.5.0**: Motor Bezier para trayectorias curvas realistas.
- **v9.7.5**: Hitbox Expandida para selección de consignas y renderizado en capa superior.
- **v9.8.0**: Live Text Input en Toolbar (Eliminación de prompts externos).
- **v9.8.1**: Forzado 1:1 en píxeles para jugadores, círculos, balones y setas.
- **v9.8.2**: Autoincremento de dorsales al duplicar (n+1).
- **v9.8.6**: Fidelidad Total de Materiales (sombras y texturas) en Pizarra Promo.
- **v9.8.7**: Activación de Carriles en Promo para unificación de experiencia.

## 6. Auditoría de Estado Actual (v9.9.0)
- **Seguridad**: Bypass administrativo verificado en reglas de base de datos.
- **Datos**: Mapeo completo de formularios de Biblioteca y Academy para futura migración a Firestore.
