# Copia esto en Vercel (2 minutos)

---

## TrendPulse (empieza por este)

1. https://vercel.com/new → **SynqAISports** → **Import**
2. **Root Directory:** déjalo **vacío** (no toques nada)
3. Rama: `main`
4. **Deploy**

**Deberías ver:** fondo oscuro, "TrendPulse", tabla con Labubu.

---

## Si te sale error de Next.js

Significa que en **Root Directory** hay algo escrito (ruta vieja).

1. **Settings** → **General** → **Root Directory**
2. Bórralo todo o pon solo `./`
3. **Save** → **Deployments** → **Redeploy**

Rutas que **ya no existen** (no uses):
- `nexus-labs/apps/trendpulse`
- `apps/trendpulse`

---

## Nexus (opcional, otro proyecto)

Root Directory:

```
apps/nexus
```

---

## Pégame esto

```
URL TrendPulse: 
¿Ves Labubu?: sí/no
```

---

## Radar — guardar scrape (SUPABASE_SECRET_KEY)

Sin esto el radar **lee** pero **no guarda** noticias scrapeadas.

1. Supabase → **Project Settings** → **API Keys** → copia **Secret key** (`sb_secret_...`)
   - No uses la Publishable ni la anon.
   - Alternativa legacy: pestaña **Legacy API Keys** → `service_role` (empieza por `eyJ`)
2. Vercel → proyecto TrendPulse → **Settings** → **Environment Variables**
3. Añade:
   - **Name:** `SUPABASE_SECRET_KEY` (nombre exacto, sin espacios)
   - **Value:** pega la secret key completa
   - **Environments:** marca **Production** (obligatorio)
4. **Save**
5. **Deployments** → deploy más reciente de `main` → **Redeploy**
6. Comprueba en el navegador: `https://TU-DOMINIO/api/radar/status`
   - Debe decir `"secretKey": true`
7. Luego abre `/radar` o `/api/cron/ingest` → `"persisted": true`
