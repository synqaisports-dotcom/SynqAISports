
# SynqSports Pro - Technical Blueprint v10.0.0

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

## 3. Estado de Datos, Auth y Seguridad
*   **Autenticación**: Supabase Auth activo.
*   **Base de Datos**: Supabase (PostgreSQL + políticas de seguridad).
*   **Persistencia Freemium**: `localStorage` activo como capa de captacion para modo gratuito sin friccion.

### 3.3 Campañas promocionales y tracking
*   **Datos**: tablas `promo_campaigns` y `promo_campaign_events` (migración `supabase/migrations/20260324120000_promo_campaigns.sql`), trigger de `updated_at`, RPC `record_promo_scan(p_token)` que incrementa `scan_count` respetando `expires_at` y `max_uses`.
*   **Seguridad**: RLS para que solo **superadmin** gestione CRUD de campañas; el tracking público usa la capa API con anon key.
*   **API**: `POST /api/promo/track` con body `{ "token": "..." }`.
*   **Login**: query `?token=` o `?t=` en `/login` dispara el track (con salvaguarda anti doble envío).
*   **Admin-global /promos**: persistencia en Supabase con sesión; país (ALL + ISO), canal (Reels, TikTok, Shorts, etc.), periodicidad, tope de escaneos (vacío = ilimitado), QR según origen actual, métricas desde datos reales.
*   **IA**: flujo `generate-promo-campaign` con plataformas tipo Reels, TikTok, Shorts, etc.
*   **Operativa**: ejecutar la migración en el SQL Editor de Supabase (o pipeline de migraciones). Si el trigger fallara por sintaxis, revisar en tu versión de Postgres `EXECUTE FUNCTION` frente a `EXECUTE PROCEDURE`.

### 3.4 Modelo de facturación al club (B2B)
*   **Principio**: el cobro orientado de SynqAI es **al club** (cuota B2B), no a jugadores ni familias como pagadores directos de la plataforma.
*   **Promos y copy**: textos de planes y campañas alineados con **cuota al club** y conversión de nodos club, no con micropagos por atleta/tutor en esta fase.
*   **Usuarios / nodos**: vista con carga paralela de `profiles` + `clubs`, columna de nodo club y métricas operativas (perfiles, cuentas con club distinto de HQ global, clubes distintos, admins de club). Esos números son **base operativa** hasta integrar facturación.
*   **Stripe (fases posteriores)**: encaja dimensionar por **atletas** (o métrica equivalente acordada) × precio por club; los conteos actuales en usuarios sirven de soporte hasta tener censo de atletas consistente en BD.

## 4. PROTOCOLO_FREEMIUM_TO_PRO: Captacion y Conversion
Este protocolo define una decision de negocio estructural, no un workaround tecnico.

*   **Hook de Adquisicion (Gratis)**: El entorno `/board/*` funciona sin login pesado y persiste en `localStorage`.
*   **Coste Cero de Infraestructura**: Los datos de uso gratuito viven en el navegador del entrenador, reduciendo costes de base de datos en fase de captacion masiva.
*   **Conversion a Club Pro (1EUR/mes)**: Cuando un club profesionaliza su operativa, los datos y la identidad operativa pasan a Supabase.
*   **Segmentacion Oficial**:
    *   Publico/Promo: `localStorage` (gratis, rapido, sin friccion).
    *   Club Pro: Supabase (auth, multiusuario, persistencia centralizada, operativa profesional).

## 5. PROTOCOLO_ELITE: Acceso Total (Superadmin)
El sistema de autenticacion y roles tiene configurado el siguiente blindaje administrativo inmutable para los socios fundadores:

```ts
// PROTOCOLO_ELITE: Acceso total para administradores autorizados
const ADMIN_EMAILS = [
  "munozmartinez.ismael@gmail.com",
  "synqaisports@gmail.com",
  "admin@synqai.sports",
];
```

Este protocolo garantiza visibilidad completa sobre todos los nodos de la red para tareas de auditoría, soporte técnico de élite y gestión de ingresos.

---
**Estado Operativo**: Auditoria Integral v10.0.0 completada. Memoria tecnica blindada.
