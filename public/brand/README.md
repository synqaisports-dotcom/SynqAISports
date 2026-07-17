# SynqAI — Identidad corporativa

## Tipografía del logotipo: **Aquire Bold** (vectorial)

| Uso | Detalle |
|-----|---------|
| **Wordmark SYNQAI** | Trazos SVG generados desde **Aquire Bold** (SesoHQ) — A estilizada sin barra, Q con cola diagonal |
| **Tagline** | Mismos trazos vectoriales, tracking amplio |
| **Interfaz / app** | [Exo 2](https://fonts.google.com/specimen/Exo+2) (Google Fonts) — legible en dashboards |
| **Regenerar trazos** | `npm run brand:export` (requiere `scripts/.tmp/Aquire-Bold.otf` local, no se commitea) |

> El wordmark en UI usa `SynqWordmark` (SVG inline), **no** texto con fuente web. Así coincide con el PNG corporativo.

## Colores

| Token | Hex |
|-------|-----|
| Cyan principal | `#00E5FF` |
| Cyan suave | `#66F7FF` |
| Navy fondo | `#050A14` |
| Navy claro | `#0A1522` |
| Texto | `#FFFFFF` |
| Muted | `#94A3B8` |

## SVG

| Archivo | Uso |
|---------|-----|
| `synqai-icon.svg` | Favicon, sidebar, app icon |
| `synqai-logo-horizontal.svg` | Cabecera, documentos |
| `synqai-logo-stacked.svg` | Login, hero, redes |
| `synqai-wordmark.svg` | Solo logotipo |

## PNG

Regenerar: `npm run brand:export`

Carpeta `png/` — iconos 32–512px, logos apilado/horizontal, wordmark y `synqai-logo-marketing.png`.

## React

```tsx
import { SynqIcon } from '@/components/brand/SynqIcon';
import { SynqWordmark } from '@/components/brand/SynqWordmark';
import { SYNQ_BRAND } from '@/components/brand/brand-constants';
```
