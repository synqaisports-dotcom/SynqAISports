# SynqAI — Identidad corporativa

Imagen de marca unificada: hexágono táctico cyan, wordmark **SYNQ** + **AI**, tagline *CLUB & TACTICS PLATFORM*.

Tipografía de marca: **Exo 2** (geométrica, deportiva, tech).

## Colores

| Token | Hex |
|-------|-----|
| Cyan principal | `#00E5FF` |
| Cyan suave | `#66F7FF` |
| Navy fondo | `#050A14` |
| Navy claro | `#0A1522` |
| Texto | `#FFFFFF` |
| Muted | `#94A3B8` |

## SVG (vector, editables)

| Archivo | Uso |
|---------|-----|
| `synqai-icon.svg` | Favicon, sidebar, app icon |
| `synqai-logo-horizontal.svg` | Cabecera, documentos anchos |
| `synqai-logo-stacked.svg` | Login, hero, redes, presentaciones |
| `synqai-wordmark.svg` | Solo logotipo textual |

## PNG (exportados, listos para descargar)

Generar/actualizar: `npm run brand:export`

| Archivo | Tamaño |
|---------|--------|
| `png/synqai-icon-512.png` | 512×512 |
| `png/synqai-icon-192.png` | 192×192 |
| `png/synqai-icon-128.png` | 128×128 |
| `png/synqai-icon-64.png` | 64×64 |
| `png/synqai-icon-32.png` | 32×32 |
| `png/synqai-logo-stacked-1200.png` | 1200×1400 |
| `png/synqai-logo-stacked-800.png` | 800×933 |
| `png/synqai-logo-horizontal-1200.png` | 1200×252 (transparente) |
| `png/synqai-logo-horizontal-600.png` | 600×126 (transparente) |
| `png/synqai-wordmark-800.png` | 800×160 (transparente) |
| `synqai-logo-marketing.png` | 1024×1024 Open Graph |

## Componentes React

```tsx
import { SynqIcon } from '@/components/brand/SynqIcon';
import { SynqWordmark } from '@/components/brand/SynqWordmark';
import { SynqBrandLockup } from '@/components/brand/SynqBrandLockup';
```
