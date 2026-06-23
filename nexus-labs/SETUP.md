# Nexus Labs — Guía de cuentas y conexión

Repositorio GitLab: **https://gitlab.com/nexuslabs76-group/nexuslabs76-project**

## 1. Qué debes crear tú

| # | Cuenta | Para qué | Obligatorio día 1 |
|---|--------|----------|-------------------|
| 1 | **GitLab** grupo + proyecto | Código Nexus + TrendPulse | Sí |
| 2 | **Vercel** (conectar GitLab) | URLs públicas | Sí |
| 3 | **Supabase** `trendpulse` | ADN histórico Fase 1 | Sí |
| 4 | Dominio / Stripe / Gmail | Marca y cobros | Más adelante |

## 2. Subir código a GitLab (primera vez)

Descarga el scaffold:

https://github.com/synqaisports-dotcom/SynqAISports/archive/refs/heads/cursor/nexus-labs-init-f457.zip

1. Descomprime → carpeta `nexus-labs/`
2. GitLab → tu proyecto → **Upload file** (o Web IDE)
3. Sube a la **raíz** del repo: `apps/`, `README.md`, `SETUP.md`, `.gitignore`
4. Commit: `Initial Nexus Labs scaffold`

O con terminal:

```bash
git clone https://gitlab.com/nexuslabs76-group/nexuslabs76-project.git
cd nexuslabs76-project
# Copia aquí el contenido de nexus-labs/ del ZIP
git add .
git commit -m "Initial Nexus Labs scaffold"
git push
```

## 3. Conectar Vercel con GitLab

1. https://vercel.com → **Add New** → **Project**
2. **Import Git Repository** → **GitLab** → autoriza
3. Selecciona `nexuslabs76-group/nexuslabs76-project`
4. **Proyecto Nexus** → Root Directory: `apps/nexus` → Deploy
5. **Proyecto TrendPulse** → mismo repo → Root: `apps/trendpulse` → Deploy

## 4. Supabase (TrendPulse)

1. https://supabase.com → New project → EU (Frankfurt)
2. SQL Editor → ejecuta:
   `apps/trendpulse/supabase/migrations/20260623120000_trendpulse_phase1_dna.sql`
3. En Vercel (TrendPulse) → Environment Variables:

| Variable |
|----------|
| `NEXT_PUBLIC_SUPABASE_URL` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `SUPABASE_SERVICE_ROLE_KEY` |

→ Redeploy

## 5. Qué pegarme en Cursor

```
GitLab URL: 
Código subido: sí/no
Vercel Nexus URL: 
Vercel TrendPulse URL: 
Supabase migración: sí/no
```

## 6. Token para que el agente pueda hacer push (opcional)

GitLab → Settings → Access Tokens → crear token con `write_repository` → no lo pegues en el chat; úsalo solo en Cursor Desktop o en tu máquina.

## 7. Diseño

- **Nexus Labs**: corporativo, confianza, portfolio.
- **TrendPulse**: ágil, datos, timelines, estética radar.
