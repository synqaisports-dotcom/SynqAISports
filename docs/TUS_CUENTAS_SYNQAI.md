# Tus cuentas SynqAI — referencia rápida

Para no mezclar TrendPulse, SynqAI, GitHub y Vercel.

---

## GitHub (código SynqAI)

| Campo | Valor |
|-------|--------|
| **Organización / usuario** | `synqaisports-dotcom` |
| **Repositorio** | [github.com/synqaisports-dotcom/SynqAISports](https://github.com/synqaisports-dotcom/SynqAISports) |
| **Rama producción web** | `main` |
| **Cómo ver tu usuario** | GitHub → arriba derecha → foto → **Your profile** (ahí sale tu @usuario) |

> En el chat anterior usaste el email **`munozmartinez.ismael@gmail.com`** para Supabase Auth. Ese email suele ser el mismo de GitHub si entraste con Google, pero el **nombre de usuario** (@…) lo ves solo en tu perfil de GitHub.

---

## Vercel (www.synqai.net)

| Campo | Valor |
|-------|--------|
| **Dominio** | https://www.synqai.net |
| **Proyecto** | Debe estar conectado al repo `synqaisports-dotcom/SynqAISports` |
| **Entrada demo** | https://www.synqai.net/demo |

### Variables obligatorias (Settings → Environment Variables)

```
NEXT_PUBLIC_SUPABASE_URL=https://atwdkdqhezoddbsvffnm.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<tu anon key>
SYNQ_VERCEL_DEMO=true
SUPABASE_SERVICE_ROLE_KEY=<service role, para guardar datos>
```

Después de cambiar variables: **Deployments → Redeploy**.

---

## Supabase (base de datos SynqAI)

| Campo | Valor |
|-------|--------|
| **Proyecto** | `atwdkdqhezoddbsvffnm` |
| **URL** | https://atwdkdqhezoddbsvffnm.supabase.co |
| **Usuario Auth (chat)** | `munozmartinez.ismael@gmail.com` |
| **UID Auth** | `6be85da2-b11c-4301-bc16-bb3d7cc7cf9d` |

**No usar** el proyecto de TrendPulse para SynqAI.

---

## TrendPulse (producto separado)

- Rama Git: `trendpulse`
- Otro proyecto Vercel
- Otro Supabase (si lo creaste para TrendPulse)

---

## Si el demo no entra

1. Abre **https://www.synqai.net/demo** (no `/portal` directo la primera vez).
2. Debe llevarte al portal con banner amarillo arriba.
3. Si vuelves al login: en Vercel faltan variables o hay que **Redeploy** tras el último fix.
