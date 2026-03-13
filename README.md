
# SynqSports Pro - Technical Blueprint v9.9.0

Este documento resume la arquitectura técnica y el estado actual del desarrollo para la coordinación del equipo de socios.

## 1. Stack Tecnológico (Core)
*   **Framework**: Next.js 15 (App Router).
*   **Lenguaje**: TypeScript.
*   **UI/UX**: Tailwind CSS + ShadCN UI + Lucide React.
*   **Motores IA**: Genkit + Google Gemini 1.5 Flash.

## 2. Arquitectura de Rutas y Navegación
La plataforma utiliza un sistema de **Micro-Apps** basado en el rol del usuario:
*   `/admin-global/*`: Núcleo de Control (Superadmin).
*   `/dashboard/*`: Terminal Operativa (Coach/Admin Club).
*   `/board/*`: Pizarras Tácticas (Training, Match, Promo).

## 3. Estado de Firebase y Seguridad de Datos
*   **Autenticación**: Firebase Auth activo.
*   **Base de Datos**: Firestore (Estructura NoSQL).
*   **Persistencia Prototipo**: Sistema de `localStorage` activo para asegurar la integridad de datos globales (Clubs, Usuarios, Logs) entre sesiones de desarrollo.

## 4. PROTOCOLO_ÉLITE: Acceso Total (Superadmin)
Las Security Rules de Firestore y el sistema de autenticación tienen configurado el siguiente blindaje administrativo inmutable para los socios fundadores:.

```rules
// PROTOCOLO_ELITE: Acceso total para administradores autorizados
match /{document=**} {
  allow read, write: if request.auth != null && 
    request.auth.token.email in ['munozmartinez.ismael@gmail.com', 'synqaisports@gmail.com'];
}
```

Este protocolo garantiza visibilidad completa sobre todos los nodos de la red para tareas de auditoría, soporte técnico de élite y gestión de ingresos.

---
**Estado Operativo**: Auditoría Integral v9.9.0 completada. Memoria técnica blindada.
