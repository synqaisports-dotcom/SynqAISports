# SynqAI Sports — Checklist operativa

Guía paso a paso de **todo lo que debes ir haciendo tú** (manual) mientras el desarrollo avanza en ramas. Marca cada ítem cuando lo completes.

**Última actualización:** fase web portal + cantera + metodología · rama `cursor/synq-web-club-f457`

---

## Leyenda de ramas

| Rama | Contenido | Estado |
|------|-----------|--------|
| `main` | Landing SynqAI + documentación | Producción actual |
| `cursor/synq-web-club-f457` | Web: index, login, portal, cantera, metodología | En desarrollo |
| `cursor/synq-coach-free-f457` | App Android Synq Coach Free | En desarrollo |
| `trendpulse` | TrendPulse (producto separado) | Independiente |

---

## Fase A — Infraestructura base (hazlo una vez)

### A1. Proyecto Supabase SynqAI

- [ ] Crear proyecto nuevo en [supabase.com/dashboard](https://supabase.com/dashboard) (nombre ej. `synqai-sports`)
- [ ] **No reutilizar** el proyecto de TrendPulse
- [ ] Anotar **Project URL** y **Publishable (anon) key**

### A2. Migraciones SQL (en orden)

En **SQL Editor** del proyecto SynqAI, ejecutar **en este orden**:

1. [ ] `supabase/migrations/20260701000000_synqai_init.sql`
2. [ ] `supabase/migrations/20260702000000_synqai_portal.sql`
3. [ ] `supabase/migrations/20260703000000_synqai_cantera.sql`
4. [ ] `supabase/migrations/20260704000000_synqai_methodology.sql`
5. [ ] `supabase/migrations/20260705000000_synqai_exercise_sheet.sql`

> Si ya ejecutaste migraciones anteriores, solo añade las que falten.

### A3. Variables de entorno locales

- [ ] Copiar `.env.example` → `.env.local` en la raíz del repo web
- [ ] Rellenar:
  ```bash
  NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJ...
  ```

### A4. Variables en Vercel (cuando despliegues web)

En el proyecto **www.synqai.net**:

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- [ ] (Futuro) `SUPABASE_SECRET_KEY` solo si hay APIs server-side con service role

---

## Fase B — Primer club de prueba (portal web)

### B1. Usuario de acceso

- [ ] Supabase → **Authentication → Users → Add user**
- [ ] Email + contraseña (ej. `director@miclub.test`)
- [ ] Confirmar email si el proyecto lo exige

### B2. Crear club en base de datos

En SQL Editor:

```sql
insert into public.synq_clubs (name, slug, players_count, is_founding, invite_code)
values (
  'Club Piloto Madrid',
  'club-piloto-madrid',
  80,
  true,
  'SYNQ2026'
)
returning id;
```

- [ ] Copiar el `id` (UUID) del club creado

### B3. Vincular usuario al club (staff)

Sustituir `<club-uuid>` y `<user-uuid>` (el UUID del usuario en Authentication → Users):

```sql
insert into public.synq_staff (club_id, user_id, role)
values ('<club-uuid>', '<user-uuid>', 'admin');
```

- [ ] Ejecutar el insert
- [ ] Verificar que no hay error de foreign key

### B4. Probar portal en tu PC

```bash
git fetch origin
git checkout cursor/synq-web-club-f457
npm install
npm run dev
```

Abrir http://localhost:9100

- [ ] Landing carga (vídeo, calculadora, formulario founding)
- [ ] `/login` → entrar con el usuario creado
- [ ] `/portal` → dashboard con KPIs
- [ ] `/portal/club` → editar datos y guardar
- [ ] `/portal/config` → ver/generar código QR del club
- [ ] `/portal/cantera` → crear equipo y jugadores
- [ ] `/portal/metodologia` → resumen con contadores
- [ ] `/portal/metodologia/ejercicios` → crear ejercicio con pizarra web
- [ ] `/portal/metodologia/microciclos` → crear microciclo y asignar ejercicios a slots
- [ ] `/portal/metodologia/objetivos` → guardar objetivos por categoría/temporada
- [ ] `/portal/metodologia/solicitudes` → probar flujo aprobar/rechazar (manual)

### B5. Probar formulario founding (público)

- [ ] En la landing, sección **Founding club**, enviar solicitud de prueba
- [ ] En Supabase → Table Editor → `synq_founding_leads` → comprobar fila `pending`

---

## Fase C — Despliegue web a producción

### C1. Merge del portal a main

- [ ] Revisar PR: `cursor/synq-web-club-f457` → `main`
- [ ] Merge cuando estés conforme
- [ ] Vercel redeploy automático

### C2. Verificación en producción

- [ ] https://www.synqai.net carga la landing nueva
- [ ] Formulario founding guarda en Supabase
- [ ] Login y portal funcionan con las mismas credenciales de prueba

### C3. Vídeo hero (cuando tengas material)

- [ ] Grabar o editar reel del producto SynqAI
- [ ] Subir a CDN (Supabase Storage, Cloudflare, etc.)
- [ ] Sustituir URL del vídeo demo en `src/app/page.tsx`

---

## Fase D — App Android Synq Coach Free

Rama: `cursor/synq-coach-free-f457`

### D1. Entorno de desarrollo

- [ ] Instalar **Android Studio** (Ladybug o superior)
- [ ] JDK 17+
- [ ] Android SDK 34

### D2. Abrir y ejecutar

```bash
git checkout cursor/synq-coach-free-f457
```

- [ ] Android Studio → Open → `apps/synq-coach`
- [ ] Crear emulador tablet (API 26+)
- [ ] Run `app` → probar pizarra, equipo, microciclos, liga

### D3. Google Play Console (cuando quieras internal testing)

- [ ] Cuenta desarrollador Google Play (pago único ~25 USD)
- [ ] Crear app `com.synqai.coach`
- [ ] Generar **keystore** de firma release
- [ ] Configurar signing en `apps/synq-coach/app/build.gradle.kts`
- [ ] Build AAB: `cd apps/synq-coach && ./gradlew :app:bundleRelease`
- [ ] Subir AAB a track **Internal testing**
- [ ] Añadir testers por email

### D4. AdMob (antes de producción pública)

- [ ] Crear cuenta [AdMob](https://admob.google.com)
- [ ] Registrar app `com.synqai.coach`
- [ ] Crear unidad **banner**
- [ ] Reemplazar IDs de prueba en:
  - `apps/synq-coach/app/src/main/AndroidManifest.xml` → `APPLICATION_ID`
  - `apps/synq-coach/app/src/main/res/layout/activity_main.xml` → `adUnitId`

### D5. Merge Android a main (opcional)

- [ ] Revisar PR `cursor/synq-coach-free-f457` → `main`
- [ ] El código Android vive en `apps/synq-coach/`; no afecta al deploy Vercel web

---

## Fase E — Founding clubs reales (GTM)

### E1. Proceso comercial

- [ ] Definir lista de 10 clubes objetivo (Madrid / país piloto)
- [ ] Contacto inicial (email, visita, demo portal)
- [ ] Recoger solicitudes vía formulario web founding

### E2. Aprobar un founding lead (manual por ahora)

Cuando apruebes un club desde `synq_founding_leads`:

1. [ ] Crear fila en `synq_clubs` con `is_founding = true`, `founding_until = now() + 12 months`
2. [ ] Crear usuario Auth para el director
3. [ ] Insert en `synq_staff`
4. [ ] Generar `invite_code` desde `/portal/config` o SQL
5. [ ] Enviar credenciales + código al club por canal seguro
6. [ ] Marcar lead: `update synq_founding_leads set status = 'approved' where id = '...'`

> Flujo de aprobación automática en SynqAI Admin — **pendiente de desarrollo**.

---

## Fase F — Próximos desarrollos (el agente / tú decides prioridad)

Marca cuando esté hecho en código **y** probado por ti:

| # | Módulo | Rama probable | Tu acción al terminar |
|---|--------|---------------|------------------------|
| F1 | Cantera web (equipos/jugadores) | `cursor/synq-web-club-f457` | Migración 3 + `/portal/cantera` |
| F2 | Metodología web (ejercicios, microciclos) | `cursor/synq-web-club-f457` | Migración 4 + `/portal/metodologia` |
| F3 | Patrocinadores + signage config | web | Nueva migración + probar CRUD |
| F4 | Synq Coach ↔ club (sync roster) | android + api | Código club en app + Supabase |
| F5 | App familias | nueva app | Play Console `com.synqai.families` |
| F6 | SynqAI Admin (aprobar founding) | nueva rama | Usuario staff Nexus only |
| F7 | Torneos | web | Stripe club (fase posterior) |

---

## Fase G — Cuentas y dominios (referencia)

| Servicio | Uso | Estado |
|----------|-----|--------|
| GitHub `synqaisports-dotcom/SynqAISports` | Código | Activo |
| Vercel | Deploy `main` → synqai.net | Activo |
| Supabase B | BBDD SynqAI (`synq_*`) | **Tú: crear y migrar** |
| Supabase A | TrendPulse (`trend_*`) | Rama `trendpulse` |
| Play Console | Apps Android | **Tú: cuando publiques** |
| AdMob | Monetización Coach Free | **Tú: antes de release** |
| hello@synqai.net | Contacto founding | Verificar buzón |

---

## Comandos rápidos

```bash
# Web local
git checkout cursor/synq-web-club-f457 && npm run dev

# Build web producción
npm run build

# Android debug
cd apps/synq-coach && ./gradlew :app:assembleDebug

# Android tests
cd apps/synq-coach && ./gradlew :app:testDebugUnitTest
```

---

## Orden recomendado si empiezas hoy

1. **A1–A3** — Supabase + migraciones + `.env.local`
2. **B1–B4** — Usuario, club, staff, probar portal en local
3. **B5** — Probar founding form
4. **C1–C2** — Merge web y verificar producción
5. **D1–D2** — Probar app Android en emulador/tablet
6. **D3–D4** — Play internal + AdMob (cuando quieras testers externos)
7. **E1–E2** — Primer club founding real

---

## Documentación relacionada

- `docs/SYNQAI_DOCUMENTO_MAESTRO.md` — visión producto completa
- `docs/NEXUS_ARQUITECTURA.md` — dos productos, dos BBDD
- `apps/synq-coach/README.md` — build Android
- `.env.example` — variables web
- `supabase/README.md` — setup Supabase

---

*Este documento se actualiza con cada fase de desarrollo. Si algo no cuadra con el código, prioriza lo que veas en la rama activa.*
