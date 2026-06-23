# Copia esto en Vercel (3 minutos)

El repo **solo tiene Nexus Labs** — nada del proyecto antiguo.

---

## TrendPulse (el panel — empieza por este)

1. Abre https://vercel.com/new
2. Elige el repo **SynqAISports** → **Import**
3. Donde pone **Root Directory** → clic en **Edit**
4. **Copia y pega exactamente esto:**

```
apps/trendpulse
```

5. Rama: `main` (por defecto, no tocar)
6. Clic en **Deploy**
7. Espera 2 minutos → abre la URL

**Deberías ver:** fondo oscuro, título "TrendPulse", tabla con Labubu, botón "Copiar informe para Cursor".

---

## Nexus (web corporativa — opcional hoy)

Crea **otro proyecto nuevo** en Vercel y pega:

```
apps/nexus
```

**Deberías ver:** "Nexus Labs", lista de productos.

---

## Si sigues viendo la web vieja

Tu proyecto Vercel tiene la **carpeta antigua** guardada en caché.

1. **Settings** → **Root Directory** → pega `apps/trendpulse`
2. **Deployments** → **Redeploy** (marca "Use existing Build Cache" desactivado si aparece)

---

## Pégame esto cuando funcione

```
URL TrendPulse: 
¿Ves Labubu en la tabla?: sí/no
```
