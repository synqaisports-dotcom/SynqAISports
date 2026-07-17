# SynqAI Brand Assets

Recursos generados a partir del logo SYNQAI (hexágono táctico + wordmark).

## SVG (recomendado para la app)

| Archivo | Uso |
|---------|-----|
| `synqai-icon.svg` | Sidebar, favicon, botones, avatares de marca |
| `synqai-logo-horizontal.svg` | Cabecera pública, navbar, documentos |
| `synqai-logo-stacked.svg` | Splash, login, marketing, redes |
| `synqai-wordmark.svg` | Solo texto cuando el icono va aparte |

## Raster

| Archivo | Uso |
|---------|-----|
| `synqai-logo-marketing.png` | Previews, Open Graph, presentaciones |

## Componente React

```tsx
import { SynqBrand } from '@/components/brand/SynqBrand';

<SynqBrand variant="icon" width={36} />
<SynqBrand variant="horizontal" width={200} />
```

## Colores de marca

- Cyan principal: `#00F2FF`
- Cyan suave: `#66F7FF`
- Fondo navy: `#050D14` / `#0B111B`
- Texto: `#FFFFFF`
- Tagline: `#94A3B8`
