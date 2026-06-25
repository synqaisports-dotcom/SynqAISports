# Nexus Labs — arquitectura de productos

Decisión: **cada producto por separado** (deploy, base de datos, rama Git). Nexus Labs es solo la **marca paraguas**.

## Mapa

```
Nexus Labs (marca)
├── SynqAI Sports     → rama main        → www.synqai.net     → Supabase B (synq_*)
├── TrendPulse        → rama trendpulse  → trendpulse.*       → Supabase A (trend_*)
└── Landing corporativa → apps/nexus      → nexuslabs.io       → sin DB (estático)
```

## GitHub (un repo, dos ramas)

| Rama | Qué despliega | Root Vercel |
|------|---------------|-------------|
| `main` | SynqAI Sports | `./` |
| `trendpulse` | TrendPulse | `./` |

## Vercel (dos proyectos)

### Proyecto 1 — SynqAI (`www.synqai.net`)

- **Production Branch:** `main`
- **Root Directory:** vacío
- **Sin crons** (por ahora)
- Env: credenciales **Supabase SynqAI**

### Proyecto 2 — TrendPulse

- **Production Branch:** `trendpulse`
- **Root Directory:** vacío
- **Crons:** ingest + marketplace (`vercel.json` en esa rama)
- Env: credenciales **Supabase TrendPulse** (el proyecto actual)

### Proyecto 3 (opcional) — Nexus landing

- Rama `main`, Root `apps/nexus`

## Supabase (dos proyectos)

| Proyecto | Uso | Tablas |
|----------|-----|--------|
| **A — TrendPulse** | Radar, ADN, marketplace, ciclo patio | `trend_*` |
| **B — SynqAI** | Clubes, jugadores, suscripciones | `synq_*` |

Ventajas: aislamiento, facturación clara, un fallo en crons TrendPulse no toca SynqAI.

## Pasos que debes hacer en Vercel (una vez)

1. Proyecto actual `synqai.net` → **Settings → Git → Production Branch** = `main` → redeploy
2. Crear proyecto **TrendPulse** → conectar mismo repo → **Production Branch** = `trendpulse`
3. Copiar env Supabase actuales al proyecto TrendPulse
4. Crear Supabase nuevo para SynqAI → env en proyecto synqai.net
5. Quitar env TrendPulse del proyecto synqai.net cuando SynqAI no los necesite

## Documentación por producto

- SynqAI Supabase: `supabase/README.md` (rama main)
- TrendPulse deploy: `docs/TRENDPULSE_DEPLOY.md` (rama trendpulse)
