# Ver TrendPulse en 10 minutos (sin repo nuevo)

Si `nexuslabs76-arch/nexus` o GitLab dan problemas, **no hace falta arreglarlos hoy**.
El código ya está guardado y funcionando aquí:

**Repositorio:** https://github.com/synqaisports-dotcom/SynqAISports  
**Rama:** `cursor/nexus-labs-init-f457`  
**Carpeta del proyecto:** `nexus-labs/`

---

## Paso 1 — Crear cuenta en Vercel (gratis)

1. Entra en https://vercel.com/signup  
2. Elige **Continue with GitHub** (usa la misma cuenta que SynqAISports).  
3. Autoriza a Vercel a leer tus repos.

---

## Paso 2 — Desplegar la web corporativa Nexus

1. En Vercel → **Add New…** → **Project**  
2. Busca el repo **SynqAISports** → **Import**  
3. Configura así:

| Campo | Valor |
|-------|-------|
| Project Name | `nexus-labs-web` (o el que quieras) |
| Framework Preset | Next.js |
| Root Directory | `nexus-labs/apps/nexus` |
| Branch | `cursor/nexus-labs-init-f457` |

4. **Deploy** y espera ~2 minutos.  
5. Copia la URL que te da (ej. `https://nexus-labs-web.vercel.app`).

---

## Paso 3 — Desplegar TrendPulse (panel de tendencias)

1. Vercel → **Add New…** → **Project** otra vez  
2. Mismo repo **SynqAISports** → **Import**  
3. Configura:

| Campo | Valor |
|-------|-------|
| Project Name | `trendpulse` |
| Root Directory | `nexus-labs/apps/trendpulse` |
| Branch | `cursor/nexus-labs-init-f457` |

4. **Deploy**.  
5. Copia la URL (ej. `https://trendpulse.vercel.app`).

> Sin Supabase verás **modo demo** (1 caso Labubu). Eso es normal: la app ya funciona.

---

## Paso 4 — Qué pegarme en Cursor cuando termines

```
Vercel Nexus URL: 
Vercel TrendPulse URL: 
¿Deploy OK?: sí/no
```

Con eso seguimos: Supabase, más casos históricos, diseño, etc.

---

## ¿Y el repositorio propio de Nexus Labs?

**Más adelante**, cuando quieras separar de SynqAISports:

| Opción | Cuándo usarla |
|--------|----------------|
| **GitHub nuevo** (`nexuslabs76-arch/nexus`) | Recrear el repo vacío en GitHub y subir el ZIP |
| **GitLab** (`nexuslabs76-project`) | Si prefieres GitLab; conectar Vercel a GitLab |
| **Seguir en SynqAISports** | Válido meses; solo es carpeta `nexus-labs/` |

ZIP listo para subir manualmente:  
https://github.com/synqaisports-dotcom/SynqAISports/archive/refs/heads/cursor/nexus-labs-init-f457.zip  
(descomprime → sube solo la carpeta `nexus-labs/`)

---

## Resumen

| Qué quieres | Solución hoy |
|-------------|--------------|
| **Ver la app en el móvil/PC** | Vercel (pasos 1–3) |
| **Código guardado** | Ya está en GitHub (rama arriba) |
| **Repo marca Nexus** | Opcional; no bloquea ver el producto |

No instales Node, no uses terminal, no toques la Danger Zone de GitHub.
