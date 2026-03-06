# SynqSports Pro - Technical Blueprint v1.0

Este documento resume la arquitectura técnica y el estado actual del desarrollo para la coordinación del equipo de socios.

## 1. Stack Tecnológico (Core)
*   **Framework**: Next.js 15 (App Router) - Arquitectura de Server Components para máximo rendimiento.
*   **Lenguaje**: TypeScript (Tipado estricto para modelos de datos de clubes y usuarios).
*   **UI/UX**: 
    *   **Tailwind CSS**: Sistema de diseño basado en utilidades.
    *   **ShadCN UI**: Componentes de alta fidelidad (Tablas, Diálogos, Sidebars).
    *   **Lucide React**: Biblioteca de iconos vectoriales de alto rendimiento.
*   **Motores IA**: Genkit + Google Gemini 1.5 Flash (Generación de planes, ejercicios y estrategias de marketing).

## 2. Arquitectura de Rutas y Navegación
La plataforma utiliza un sistema de **Micro-Apps** basado en el rol del usuario:

*   `/`: Index/Landing - Punto de entrada con protocolo visual de "escaneo de red".
*   `/login`: Terminal de Identidad - Soporta acceso estándar y **Magic Links (QR)** con detección de tokens regionales.
*   `/admin-global/*`: **Núcleo de Control (Superadmin)**. Gestión de red de clubes, planes de suscripción (escalado de 1€ a 0.70€), roles y factoría de Magic Links.
*   `/dashboard/*`: **Terminal Operativa (Coach/Admin Club)**. Gestión de atletas, entrenamientos y acceso al túnel de Onboarding.
*   `/board`: Pizarra Táctica (Futura implementación 3D/2D).

## 3. Estado de Firebase y Seguridad de Datos
*   **Autenticación**: Firebase Auth activo (Google y Email/Password).
*   **Base de Datos**: Firestore (Estructura NoSQL).
*   **Aislamiento de Datos (Multi-tenant)**:
    *   Cada club opera bajo un `clubId` único.
    *   Las Security Rules (Protocolo de Usuario) impiden que un administrador de un club acceda a los datos de otro.
*   **Sincronización de Sesión**: Implementada persistencia en `localStorage` para el prototipo, asegurando que el rol no se pierda al refrescar.

## 4. Lógica del Bypass (Administración de Élite)
Se ha programado un **Protocolo de Acceso Total (Superadmin)**. Las Security Rules de Firestore tienen configurado el siguiente bypass de seguridad:

```rules
// PROTOCOLO_ELITE: Acceso total para administradores autorizados
match /{document=**} {
  allow read, write: if request.auth != null && 
    request.auth.token.email in ['munozmartinez.ismael@gmail.com', 'synqaisports@gmail.com'];
}
```

Este protocolo permite que el socio fundador (`munozmartinez.ismael@gmail.com`) tenga visibilidad completa sobre todos los nodos de la red para tareas de auditoría y soporte técnico.

---
**Estado Operativo**: Sistema de Magic Links y QR por país 100% funcional.
