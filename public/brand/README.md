# SynqAI — Identidad corporativa

## Tipografía oficial: **Orbitron**

| Uso | Detalle |
|-----|---------|
| **Nombre** | [Orbitron](https://fonts.google.com/specimen/Orbitron) (Google Fonts, gratuita) |
| **Estilo** | Sans geométrica, angular, tech/deporte — alineada con el hexágono táctico |
| **Wordmark SYNQAI** | Orbitron **800** (Extra Bold), mayúsculas, tracking `0.12em` |
| **Tagline** | Orbitron **600** (Semi Bold), tracking `0.32em` |
| **App / web** | Orbitron en toda la interfaz vía `next/font` |

> El logotipo del PNG de marketing usa trazos personalizados. En producto digital usamos **Orbitron** como equivalencia oficial hasta disponer de una fuente custom.

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
