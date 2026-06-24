# Conectar Supabase a TrendPulse (10 min)

TrendPulse ya funciona en Vercel en **modo demo**. Con Supabase verás **25 casos** reales.

---

## Paso 1 — Crear proyecto Supabase

1. https://supabase.com → **Start your project** (cuenta gratis)
2. **New project**
   - Nombre: `trendpulse`
   - Región: **Frankfurt (eu-central-1)**
   - Contraseña: guárdala en un sitio seguro
3. Espera ~2 minutos a que arranque

---

## Paso 2 — Ejecutar el SQL (crear tablas + datos)

1. En Supabase → **SQL Editor** → **New query**
2. Abre este archivo en GitHub y copia **todo** el contenido:

   `supabase/migrations/20260623120000_trendpulse_phase1_dna.sql`

3. Pega → **Run**
4. Repite con el segundo archivo:

   `supabase/migrations/20260623230000_trendpulse_seed_25_cases.sql`

Debería decir **Success**.

---

## Paso 3 — Copiar claves a Vercel

1. Supabase → **Project Settings** → **API**
2. Copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Publishable key** (`sb_publishable_...`) → `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
     (o crea `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` con el mismo valor)

   > **No escribas la palabra "anon".** Copia la clave entera con el botón Copy.
   > La clave **Secret** (`sb_secret_...`) no va en Vercel para TrendPulse.
3. Vercel → tu proyecto TrendPulse → **Settings** → **Environment Variables**
4. Añade las dos variables → **Save**
5. **Deployments** → **Redeploy**

---

## Paso 4 — Comprobar

Abre tu URL de TrendPulse. El aviso amarillo de "modo demo" debe desaparecer y ver **25 casos** en la tabla.

Pégame el informe de nuevo con el botón **Copiar informe para Cursor**.

---

## Enlaces directos a los SQL en GitHub

- [Migración tablas + 12 casos](https://github.com/synqaisports-dotcom/SynqAISports/blob/main/supabase/migrations/20260623120000_trendpulse_phase1_dna.sql)
- [13 casos adicionales (25 total)](https://github.com/synqaisports-dotcom/SynqAISports/blob/main/supabase/migrations/20260623230000_trendpulse_seed_25_cases.sql)
