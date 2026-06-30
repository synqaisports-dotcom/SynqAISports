/** Texturas de superficie para la pizarra (canvas, alta calidad). */

let grassCache: HTMLImageElement | null = null;

function createImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

function renderGrassTexture(): string {
  const s = 256;
  const canvas = document.createElement('canvas');
  canvas.width = s;
  canvas.height = s;
  const ctx = canvas.getContext('2d')!;
  const stripes = 18;
  const sw = s / stripes;

  for (let i = 0; i < stripes; i++) {
    const grad = ctx.createLinearGradient(i * sw, 0, (i + 1) * sw, 0);
    if (i % 2 === 0) {
      grad.addColorStop(0, '#45b85a');
      grad.addColorStop(1, '#3daa52');
    } else {
      grad.addColorStop(0, '#358f44');
      grad.addColorStop(1, '#2f8440');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(i * sw, 0, sw + 1, s);
  }

  for (let n = 0; n < 5000; n++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.035})`;
    ctx.fillRect(Math.random() * s, Math.random() * s, 1, 1);
  }
  for (let n = 0; n < 3500; n++) {
    ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.04})`;
    ctx.fillRect(Math.random() * s, Math.random() * s, 1, 1);
  }

  return canvas.toDataURL('image/png');
}

export async function getGrassTexture(): Promise<HTMLImageElement> {
  if (typeof document === 'undefined') throw new Error('Grass texture requires browser');
  if (grassCache) return grassCache;
  grassCache = await createImage(renderGrassTexture());
  return grassCache;
}

export const FUTSAL_COLORS = {
  border: '#1a4d7a',
  court: '#5eb8e8',
  line: '#ffffff',
} as const;

export const FOOTBALL_COLORS = {
  line: '#ffffff',
  lineShadow: 'rgba(0,0,0,0.15)',
} as const;
