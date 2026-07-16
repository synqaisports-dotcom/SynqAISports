# Supabase + Vercel desde cero (SynqAI Sports)

Guía para montar **un proyecto Supabase nuevo** y conectarlo a **Vercel**, cuando las variables o proyectos anteriores ya no existen.

---

## Resumen rápido

| Paso | Dónde | Qué |
|------|--------|-----|
| 1 | Supabase | Crear proyecto vacío |
| 2 | Supabase SQL Editor | Ejecutar esquema completo |
| 3 | Supabase SQL Editor | Ejecutar seed del club demo (opcional) |
| 4 | Supabase Auth | Site URL + redirect URLs |
| 5 | Vercel | Variables de entorno |
| 6 | Vercel | Redeploy + probar `/demo` |

**Recomendación:** dos proyectos Supabase separados:

- `synqai-staging` → Preview Vercel + pruebas
- `synqai-prod` → Production (`main`) cuando esté listo

Mismas migraciones en ambos; solo cambian las claves.

---

## 1. Crear proyecto en Supabase

1. Entra en [supabase.com/dashboard](https://supabase.com/dashboard)
2. **New project**
3. Nombre sugerido: `synqai-staging` (o `synqai-sports`)
4. Contraseña de base de datos: guárdala en un gestor de contraseñas
5. Región: la más cercana a tus usuarios (ej. `West EU` para España)
6. Espera a que el proyecto termine de provisionarse (~2 min)

> **No reutilices** el proyecto de TrendPulse. SynqAI usa tablas `synq_*` en un proyecto independiente.

---

## 2. Ejecutar el esquema (29 migraciones)

### Opción A — Un solo pegado (recomendado)

En tu máquina, en la raíz del repo:

```bash
npm run supabase:bundle
```

Se genera `supabase/.bundle/full_schema.sql`.

En Supabase → **SQL Editor** → **New query** → pega todo el archivo → **Run**.

Si algo falla, copia el error: suele ser porque el proyecto no estaba vacío o ya se ejecutó parte del esquema.

### Opción B — Archivo por archivo

Ejecuta en orden alfabético todo lo que hay en `supabase/migrations/` (29 archivos). Lista completa en `supabase/README.md`.

---

## 3. Club demo (modo pruebas sin login)

Si vas a usar el portal en modo demo (`SYNQ_VERCEL_DEMO=true`):

1. SQL Editor → ejecuta `supabase/seed/001_demo_club.sql`
2. El club queda con UUID fijo `00000000-0000-4000-8000-000000000001` (coincide con el código)

Opcional en Vercel: `SYNQ_DEMO_CLUB_ID=00000000-0000-4000-8000-000000000001` (no es obligatorio si solo hay un club).

---

## 4. Copiar claves de API

Supabase → **Project Settings** → **API**

| Campo en Supabase | Variable en Vercel / `.env.local` |
|-------------------|-----------------------------------|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| `anon` / **publishable** key | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` |
| `service_role` / **secret** key | `SUPABASE_SERVICE_ROLE_KEY` |

> El código también acepta `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `SUPABASE_SECRET_KEY` como alias, pero usa los nombres de la tabla para documentación nueva.

**Importante:** la `service_role` **nunca** va en el cliente ni en variables `NEXT_PUBLIC_*`. Solo en Vercel como variable de servidor.

---

## 5. Configurar Auth (URLs de redirección)

Supabase → **Authentication** → **URL Configuration**

| Campo | Valor (staging) | Valor (producción) |
|-------|-----------------|---------------------|
| Site URL | `http://localhost:9100` o tu preview Vercel | `https://www.synqai.net` |
| Redirect URLs | `http://localhost:9100/auth/callback` | `https://www.synqai.net/auth/callback` |

Añade también las URLs de preview de Vercel si usas login en ramas:

```
https://*.vercel.app/auth/callback
```

(o cada preview concreto si prefieres lista cerrada)

---

## 6. Primer usuario con login real (cuando quites demo)

1. **Authentication** → **Users** → **Add user** → email + contraseña
2. Copia el **User UID** (UUID)
3. SQL Editor:

```sql
insert into public.synq_staff (club_id, user_id, role)
values (
  '00000000-0000-4000-8000-000000000001',  -- o tu club real
  '<AUTH_USER_UUID>',
  'admin'
);
```

4. Entra en `/login` con ese email/contraseña → `/portal`

Roles válidos: `president`, `sport_director`, `methodology`, `coordinator`, `treasurer`, `coach`, `admin`.

---

## 7. Variables en Vercel

Vercel → tu proyecto SynqAI → **Settings** → **Environment Variables**

### Fase actual — portal demo (recomendado hasta merge a `main`)

Marca **Production** y **Preview**:

| Variable | Valor |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<tu-proyecto>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | clave anon/publishable |
| `SYNQ_VERCEL_DEMO` | `true` |
| `SUPABASE_SERVICE_ROLE_KEY` | clave service_role |

Sin `SUPABASE_SERVICE_ROLE_KEY` ves la UI pero **no persiste** ejercicios, solicitudes ni cambios en BD.

### Fase producción — login real

| Variable | Valor |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL producción |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | publishable producción |
| `SYNQ_VERCEL_DEMO` | `false` o eliminar |
| `NEXT_PUBLIC_SYNQ_DEMO_MODE` | `false` o eliminar |

La `service_role` solo si alguna acción server-side la necesita en prod (evaluar con cuidado).

### Desarrollo local

Copia `.env.example` → `.env.local` y rellena las mismas variables.

```bash
npm run dev
# http://localhost:9100
# Entrada demo: http://localhost:9100/demo
```

---

## 8. Conectar Vercel al repo

| Ajuste | Valor |
|--------|--------|
| Framework | Next.js (auto) |
| Root Directory | `/` (raíz) |
| Build Command | `npm run build` |
| Production Branch | `main` (cuando fusiones) |

Tras cambiar variables: **Deployments** → **Redeploy** (obligatorio).

---

## 9. Comprobar que funciona

1. `https://tu-dominio/demo` → debe cargar el portal sin login
2. Campana cyan arriba = modo demo activo
3. Rutas clave:
   - `/portal/entrenador`
   - `/portal/metodologia`
   - `/portal/cantera`
   - `/portal/club`
4. Crea un ejercicio o solicitud de cambio → recarga → debe persistir (necesita `service_role`)

### Si falla

| Síntoma | Causa probable |
|---------|----------------|
| Redirige a `/login` | Falta `SYNQ_VERCEL_DEMO=true` y no visitaste `/demo` |
| UI ok pero no guarda | Falta `SUPABASE_SERVICE_ROLE_KEY` |
| Error al cargar portal | Migraciones incompletas o URL/key incorrectas |
| Login ok pero “sin club” | Falta fila en `synq_staff` |

---

## 10. Cuándo pasar a `main`

Checklist antes de producción real:

- [ ] Staging Supabase con todas las migraciones
- [ ] Vercel Preview conectado y probado
- [ ] Persistencia verificada (ejercicios, solicitudes, cantera)
- [ ] Proyecto Supabase **producción** creado (clon del esquema)
- [ ] Variables Production en Vercel apuntando a prod
- [ ] Merge de la rama de trabajo a `main`
- [ ] Redeploy Production

---

## Referencias en el repo

- Migraciones: `supabase/migrations/`
- Bundle SQL: `npm run supabase:bundle` → `supabase/.bundle/full_schema.sql`
- Seed demo: `supabase/seed/001_demo_club.sql`
- Variables: `.env.example`
- Copia rápida Vercel: `COPIA_ESTO_EN_VERCEL.md` (actualizado sin URLs antiguas)
