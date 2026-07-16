# SynqAI en Vercel — variables de entorno

Guía completa paso a paso: **`docs/SUPABASE_VERCEL_DESDE_CERO.md`**

---

## Variables (Production + Preview)

Sustituye los valores por los de **tu proyecto Supabase nuevo**:

| Variable | Valor |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<TU-PROYECTO>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | clave **anon / publishable** (Settings → API) |
| `SYNQ_VERCEL_DEMO` | `true` |
| `SUPABASE_SERVICE_ROLE_KEY` | clave **service_role** (solo servidor) |

Opcional:

| Variable | Valor |
|----------|--------|
| `SYNQ_DEMO_CLUB_ID` | `00000000-0000-4000-8000-000000000001` (tras ejecutar el seed) |

Sin `SUPABASE_SERVICE_ROLE_KEY` ves la UI pero **no guarda** cambios en base de datos.

---

## Antes de desplegar

1. Crear proyecto Supabase vacío
2. `npm run supabase:bundle` → pegar `supabase/.bundle/full_schema.sql` en SQL Editor
3. Ejecutar `supabase/seed/001_demo_club.sql` (modo demo)
4. Añadir variables arriba en Vercel → **Redeploy**

---

## Entrar al portal (sin login)

- `https://tu-dominio/demo`
- o botón «Entrar al portal» en la home

---

## Producción real (más adelante)

- `SYNQ_VERCEL_DEMO=false`
- Usuarios en Supabase Auth + filas en `synq_staff`
- Proyecto Supabase de **producción** separado del de staging
