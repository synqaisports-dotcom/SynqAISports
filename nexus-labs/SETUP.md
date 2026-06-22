# Nexus Labs — Guía de cuentas y conexión

Sigue estos pasos en paralelo mientras el código se sube a GitHub.

## 1. Qué debes crear tú

| # | Cuenta / recurso | Para qué | Obligatorio día 1 |
|---|------------------|----------|-------------------|
| 1 | **GitHub Organization** `nexus-labs` (o tu nombre) | Repositorios del sello | Sí |
| 2 | **Repo** `nexus-labs` (privado recomendado) | Código Nexus + TrendPulse | Sí |
| 3 | **Vercel** (login con GitHub) | URLs públicas de preview | Sí |
| 4 | **Supabase** proyecto `trendpulse` | Base de datos Fase 1 (ADN histórico) | Sí (Fase 1) |
| 5 | **Dominio** `nexuslabs.es` / `.com` | Marca corporativa | No (luego) |
| 6 | **Stripe** | Preventas / cobros | No (Fase 2 comercial) |
| 7 | **Gmail** proyecto ej. `hello@` o `nexuslabs.app@gmail.com` | Registros y alertas | Recomendado |

## 2. Crear GitHub Organization + repo

1. https://github.com/organizations/plan → Free
2. Repo público: `https://github.com/nexuslabs76-arch/nexus`
3. Si el código aún no está subido, ver sección **Subir código** al final de este archivo.

## 3. Conectar Vercel (dos proyectos, un repo)

1. https://vercel.com → Add New → Project → Import `nexus-labs/nexus-labs`
2. **Proyecto A — Nexus corporativo**
   - Root Directory: `apps/nexus`
   - Framework: Next.js
   - Deploy
3. **Proyecto B — TrendPulse**
   - Add New → Project → mismo repo
   - Root Directory: `apps/trendpulse`
   - Deploy

Cada `git push` generará URL de preview. Producción: asignar dominios cuando los tengas.

## 4. Supabase (TrendPulse)

1. https://supabase.com → New project → nombre `trendpulse`, región EU (Frankfurt)
2. Guarda:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** (solo servidor, nunca en cliente) → `SUPABASE_SERVICE_ROLE_KEY`
3. SQL Editor → ejecutar migraciones en `apps/trendpulse/supabase/migrations/` (en orden)

## 5. Variables de entorno en Vercel

### Proyecto `apps/nexus`
Ninguna obligatoria al inicio.

### Proyecto `apps/trendpulse`
| Variable | Dónde obtenerla |
|----------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API (solo server) |

Tras añadirlas → Redeploy.

## 6. Cómo ver avances desde el día 1

| Qué ver | Dónde |
|---------|--------|
| Código y commits | GitHub → repo `nexus-labs` |
| Web corporativa Nexus | URL Vercel proyecto `nexus` |
| Panel TrendPulse Fase 1 | URL Vercel proyecto `trendpulse` |
| Base de datos casos ADN | Supabase → Table Editor → `trend_historical_dna` |

## 7. Qué pegarme en Cursor cuando termines

```
GitHub org: 
Repo URL: 
Vercel Nexus URL: 
Vercel TrendPulse URL: 
Supabase project ref: 
¿Migración SQL ejecutada? sí/no
Email admin TrendPulse: 
```

## 8. Subir código (si Cursor no tiene permiso de escritura)

Descarga el scaffold desde la rama de SynqAISports:

https://github.com/synqaisports-dotcom/SynqAISports/archive/refs/heads/cursor/nexus-labs-init-f457.zip

1. Descomprime el ZIP.
2. Entra en la carpeta `SynqAISports-cursor-nexus-labs-init-f457/nexus-labs/`.
3. Sube **todo su contenido** (no la carpeta `nexus-labs` en sí) a la raíz de tu repo `nexus` en GitHub (Add file → Upload files).
4. **No subas** carpetas `node_modules` ni `.next` (no vienen en el ZIP).

O con terminal en tu PC:

```bash
git clone https://github.com/nexuslabs76-arch/nexus.git
cd nexus
curl -L https://github.com/synqaisports-dotcom/SynqAISports/archive/refs/heads/cursor/nexus-labs-init-f457.tar.gz | tar xz --strip-components=2 SynqAISports-cursor/nexus-labs-init-f457/nexus-labs
git add .
git commit -m "Add Nexus Labs scaffold"
git push
```

## 9. Diseño acordado

- **Nexus Labs**: corporativo, confianza, portfolio de productos, tipografía sobria.
- **TrendPulse**: ágil, tendencias, oscuro dinámico, timelines y tablas de datos.
