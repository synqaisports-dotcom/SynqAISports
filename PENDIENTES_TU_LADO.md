# Pendientes de tu lado (SynqAI Sports)

Documento alineado con **cobro al club (B2B)** — no a jugadores/padres desde SynqAI — y con **Stripe** como siguiente fase natural.

---

## Qué está implementado en producto (referencia)

### 1. Campañas + tracking

- **Migración SQL**: `supabase/migrations/20260324120000_promo_campaigns.sql`  
  Tablas `promo_campaigns` y `promo_campaign_events`, trigger `updated_at`, RPC `record_promo_scan(p_token)` (incrementa `scan_count`, respeta `expires_at` y `max_uses`), RLS para que solo **superadmin** haga CRUD en campañas.
- **Tipos**: `PromoCampaign`, `PromoCampaignEvent` y `Database.Functions.record_promo_scan` en `src/lib/supabase.ts`.
- **API**: `POST /api/promo/track` con body `{ "token": "..." }` — llama a la RPC con la **anon key** (pública).
- **Login**: si hay `?token=` o `?t=` en `/login`, se hace `POST` a `/api/promo/track` (ref anti doble disparo).
- **Admin** (`/admin-global/promos`): carga/guarda en Supabase con sesión; país (ALL + ISO), canal (Reels, TikTok, Shorts, etc.), periodicidad, límite de escaneos (vacío = sin límite); QR con URL del origen actual; métricas desde datos reales; textos de planes orientados a **cuota al club**.
- **IA**: en `generate-promo-campaign.ts`, `platform` admite Reels, TikTok, Shorts, etc.

### 2. Usuarios + nodos club

- Carga **paralela** `profiles` + `clubs` y mapeo del **nombre de club** en cada fila.
- Columna **Nodo_Club** en la tabla de usuarios.
- Métricas: perfiles totales, cuentas con nodo club (excl. `global-hq`), clubes distintos, admins club.
- Mensaje explícito: facturación **B2B al club**; estos números son base operativa hasta **Stripe** + censo de atletas.

### 3. Documentación

- **README**: apartados **3.3** (promo + tracking) y **3.4** (modelo de facturación al club).
- Con **Stripe**, lo natural es dimensionar por **atletas** (o equivalente) × precio acordado por club; los conteos actuales en usuarios sustentan el modelo hasta que ese dato esté limpio en BD.

---

## Checklist operativo (tu lado)

### Supabase — ejecutar en SQL Editor (o `supabase db push`)

- [ ] Ejecutar la migración **promo**: `supabase/migrations/20260324120000_promo_campaigns.sql`.
  - Nota: usa `gen_random_uuid()` → si tu proyecto no tiene `pgcrypto`, habilita la extensión (SQL Editor): `create extension if not exists pgcrypto;`.
  - Si el trigger falla por sintaxis en tu Postgres, prueba `EXECUTE PROCEDURE` en lugar de `EXECUTE FUNCTION` (según doc de tu versión).
- [ ] (Si la vas a usar) Ejecutar la migración **roles / RLS**: `supabase/migrations/20250324190000_synq_roles_profile_roles_rls.sql` — staging primero, luego producción.
  - Si `profiles.role` es **ENUM** y pretendes roles custom: ampliar enum o migrar la columna a `text`.
- [ ] Validación post-migración (rápida):
  - Abrir un magic link `.../login?t=TOKEN` y comprobar que incrementa `promo_campaigns.scan_count`.
  - Entrar a `/admin-global/promos` como superadmin y comprobar: listar, crear (IA+insert), borrar.
  - Si activas RLS: probar login, onboarding (club + `profiles`), vistas por club, admin-global superadmin.

### Código / repo (ya preparado aquí)

- [x] Migración promo versionada en `supabase/migrations/20260324120000_promo_campaigns.sql`.
- [x] API `POST /api/promo/track` creada.
- [x] `/login` dispara el tracking una sola vez por token.
- [x] `/admin-global/promos` conectado a Supabase (CRUD + métricas reales + QR con `window.location.origin`).

### Servidor / despliegue

- [ ] **`SUPABASE_SERVICE_ROLE_KEY`** solo en servidor (rutas admin, almacén, analytics, etc.).
- [ ] `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` correctas.
  - Recomendación: confirmar que el runtime (Vercel/VM) tiene estas variables en **producción** y **preview**.

### Entorno local (Windows)

- [ ] Si PowerShell bloquea scripts: `npm run typecheck` / `npx tsc --noEmit` vía **cmd** o ajustar `ExecutionPolicy`.
- [ ] Si `.next` corrupto: `npm run rebuild`.

### Otros

- [ ] **Firestore** (`firestore.rules`): solo si queda algo en Firebase; alinear con Supabase como fuente de verdad si ya migraste.

### Futuro (Stripe)

- [ ] Dimensionar facturación por club según **atletas** (o métrica acordada) × precio; enlazar con censo limpio en BD cuando exista.

---

## Historial de implementación reciente (mi lado / UI ya conectada)

### 4. Metodología — Planif. Sesiones (prototipo con lógica)

- [x] En `Planif. Sesiones`:
  - Rango **real** de temporada (`Inicio` / `Fin`) para anclar los MCC a fechas reales.
  - Traducción de `SES_1..SES_N` a **días reales** dentro del microciclo (L/M/X/J/V...) usando configuración del equipo (`days`).
  - Lead-time de cambios (7 días) calculado contra la **fecha exacta del día de la sesión**, no solo contra el inicio del MCC.
  - Solicitud de cambio en UI: coach propone + motivo; director aprueba y actualiza la asignación del bloque para esa semana/MCC.
  - Botón `PDF Temporada`:
    - MVP: `window.print()`
    - Antes guarda un `payload` en `localStorage` para evolucionarlo a PDF real más adelante.

### 5. Metodología — Asistencia

- [x] La hoja de **Asistencia** ya está conectada al roster del prototipo:
  - Lee `localStorage` `synq_players`
  - Filtra por equipo (category + teamSuffix) para mostrar jugadores correctos
  - Persistencia de asistencia en el mismo state del planner por `clubId`.

### 6. Metodología — Academy/Cantera (días de equipo)

- [x] En `academy`:
  - Normaliza `days` al guardar (sin duplicados y orden fijo `L/M/X/J/V/S/D`).
  - Persiste estructura de categorías/equipos en `localStorage` por `clubId` para que `Planif. Sesiones` pueda leer esos `days`.

### 7. Metodología — Pizarra de ejercicios (Training) y Biblioteca

- [x] Si entras a la pizarra desde `exercise-library` para “editar”, se pasa `editId` y al guardar desde la pizarra se actualiza el mismo borrador (no crea uno nuevo).
- [x] La miniatura de la tarea incluye el “campo” (fondo/líneas del `TacticalField`) además del overlay de elementos.

---
## Mi lado (pendientes en código para no repasar al conectar Supabase)

### 1. Conectar “Asistencia” desde la ficha del equipo (opción A)

- [ ] Implementar que al pulsar “Asistencia” desde la ficha/operativa del equipo se abra la **próxima sesión real** según `Inicio/Fin` de temporada + `days` del equipo.
- [ ] Confirmar el mapeo exacto `MCC + día (L/M/X...) + SES` al abrir la hoja para que el registro sea el correcto.

### 2. Preparar salto a Supabase sin rehacer lógica

- [ ] Definir (en código/UI) el modelo mínimo de persistencia:
  - temporadas por club
  - MCC/microciclos calendarizados con fechas
  - sesiones por día dentro del MCC
  - asistencia por sesión
  - change_requests vinculadas a sesión/bloque
- [ ] Mantener la lógica actual como referencia y sustituir el origen local:
  - `localStorage (synq_players + academy categories)` -> Supabase

### 3. PDF real

- [ ] Implementar export real (jsPDF/pdf-lib) usando el `payload` ya guardado por `PDF Temporada`.

### Notas de despliegue (Vercel + Supabase compartido)

- [ ] Como `dev/main` apunta a la misma BD (por no pagar separaciones), hay que evitar “romper staging”:
  - feature flags
  - o migraciones compatibles

---
*Actualizado según tu refresco de estado de implementación (y lo ya conectado en sesiones/asistencia/días reales).*
