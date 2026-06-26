# SynqAI en Vercel — entorno de PRUEBAS (portal sin login)

## 1. Rama con el portal

El portal está en **`cursor/synq-web-club-f457`** (no solo en `main`).

En Vercel → **Settings → Git → Production Branch** elige una opción:

- **Opción A (rápida):** Production Branch = `cursor/synq-web-club-f457`
- **Opción B:** Merge de esa rama a `main` y deja Production Branch = `main`

Luego **Deployments → Redeploy**.

---

## 2. Variables en Vercel (copiar tal cual)

**Settings → Environment Variables** → añade estas **6** (marca Production + Preview):

| Variable | Valor |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://atwdkdqhezoddbsvffnm.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | tu anon key de Supabase |
| `SYNQ_VERCEL_DEMO` | `true` |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role de Supabase (Settings → API) |
| `SYNQ_DEMO_CLUB_ID` | *(opcional)* UUID de tu club en `synq_clubs` |

Sin `SUPABASE_SERVICE_ROLE_KEY` ves la UI pero **no guarda** ejercicios ni cambios.

---

## 3. Cómo entrar (sin login)

1. Abre **https://www.synqai.net**
2. Botón verde **«Entrar al portal de pruebas»**
3. O directo: **https://www.synqai.net/portal**

No hace falta email ni contraseña.

---

## 4. Qué puedes probar

- `/portal` — dashboard
- `/portal/cantera` — equipos y jugadores
- `/portal/metodologia` — ejercicios, microciclos, PDF
- `/portal/club` — datos del club
- `/portal/config` — código QR

Banner amarillo arriba = modo pruebas activo.

---

## 5. Cuando quieras login real

Quita o pon `SYNQ_VERCEL_DEMO=false` y configura usuarios en Supabase Auth + `synq_staff`.

---

## TrendPulse

Rama `trendpulse` → otro proyecto Vercel. No mezclar variables.
