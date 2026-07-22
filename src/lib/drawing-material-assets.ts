/** Texturas de material generadas en canvas (alta resolución, no SVG plano). */

export type MaterialKind =
  | 'player-own'
  | 'player-rival'
  | 'player-neutral'
  | 'cone'
  | 'cone-pole'
  | 'seta'
  | 'ball'
  | 'goal'
  | 'hurdle'
  | 'ladder';

const TEXTURE_SIZE = 256;
const CACHE_VERSION = 3;
const cache = new Map<string, HTMLImageElement>();

function cacheKey(kind: MaterialKind): string {
  return `${CACHE_VERSION}:${kind}`;
}

function createImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

function darken(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, ((n >> 16) & 255) * (1 - amount));
  const g = Math.max(0, ((n >> 8) & 255) * (1 - amount));
  const b = Math.max(0, (n & 255) * (1 - amount));
  return `rgb(${r | 0},${g | 0},${b | 0})`;
}

function drawPlayer(ctx: CanvasRenderingContext2D, fill: string, stroke: string, label: string) {
  const s = TEXTURE_SIZE;
  const cx = s / 2;
  const cy = s / 2 + 6;
  ctx.clearRect(0, 0, s, s);

  // Sombra en el césped
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.beginPath();
  ctx.ellipse(cx, s * 0.8, 54, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  // Disco principal — estilo marcador plano visto desde arriba
  const grad = ctx.createRadialGradient(cx, cy - 12, 8, cx, cy, 72);
  grad.addColorStop(0, lighten(fill, 0.4));
  grad.addColorStop(0.55, fill);
  grad.addColorStop(1, darken(fill, 0.2));
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, 62, 0, Math.PI * 2);
  ctx.fill();

  // Anillo exterior
  ctx.strokeStyle = 'rgba(255,255,255,0.92)';
  ctx.lineWidth = 6;
  ctx.stroke();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Brillo superior
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.beginPath();
  ctx.ellipse(cx - 14, cy - 20, 22, 12, -0.4, 0, Math.PI * 2);
  ctx.fill();

  // Número
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 54px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 2;
  ctx.fillText(label, cx, cy + 4);
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Indicador de orientación (flecha)
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.beginPath();
  ctx.moveTo(cx, 24);
  ctx.lineTo(cx - 18, 56);
  ctx.lineTo(cx + 18, 56);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawCone(ctx: CanvasRenderingContext2D) {
  const s = TEXTURE_SIZE;
  ctx.clearRect(0, 0, s, s);

  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.beginPath();
  ctx.ellipse(s / 2, s * 0.82, 48, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  const grad = ctx.createLinearGradient(s / 2, 28, s / 2, s * 0.78);
  grad.addColorStop(0, '#fdba74');
  grad.addColorStop(0.45, '#f97316');
  grad.addColorStop(1, '#c2410c');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(s / 2, 28);
  ctx.lineTo(52, s * 0.78);
  ctx.lineTo(s - 52, s * 0.78);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = 'rgba(124,45,18,0.55)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(s / 2, 28);
  ctx.lineTo(52, s * 0.78);
  ctx.stroke();

  // Franja reflectante
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.moveTo(s / 2 - 8, 52);
  ctx.lineTo(s / 2 + 8, 52);
  ctx.lineTo(s / 2 + 4, 68);
  ctx.lineTo(s / 2 - 4, 68);
  ctx.closePath();
  ctx.fill();
}

function drawSeta(ctx: CanvasRenderingContext2D) {
  const s = TEXTURE_SIZE;
  const cx = s / 2;
  const cy = s / 2 + 8;
  ctx.clearRect(0, 0, s, s);

  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.beginPath();
  ctx.ellipse(cx, s * 0.82, 50, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  // Base plana
  const baseGrad = ctx.createRadialGradient(cx, cy + 28, 4, cx, cy + 28, 58);
  baseGrad.addColorStop(0, '#fde047');
  baseGrad.addColorStop(0.6, '#facc15');
  baseGrad.addColorStop(1, '#ca8a04');
  ctx.fillStyle = baseGrad;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 30, 58, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(161,98,7,0.55)';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Cúpula
  const domeGrad = ctx.createRadialGradient(cx - 12, cy - 18, 8, cx, cy - 4, 52);
  domeGrad.addColorStop(0, '#fef08a');
  domeGrad.addColorStop(0.45, '#facc15');
  domeGrad.addColorStop(1, '#eab308');
  ctx.fillStyle = domeGrad;
  ctx.beginPath();
  ctx.ellipse(cx, cy - 2, 46, 40, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(161,98,7,0.45)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  ctx.beginPath();
  ctx.ellipse(cx - 14, cy - 18, 16, 10, -0.35, 0, Math.PI * 2);
  ctx.fill();
}

function drawConePole(ctx: CanvasRenderingContext2D) {
  const s = TEXTURE_SIZE;
  ctx.clearRect(0, 0, s, s);
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.arc(s / 2, 44, 26, 0, Math.PI * 2);
  ctx.fill();
  const pole = ctx.createLinearGradient(116, 60, 140, 220);
  pole.addColorStop(0, '#f8fafc');
  pole.addColorStop(1, '#94a3b8');
  ctx.fillStyle = pole;
  ctx.fillRect(116, 60, 24, 164);
}

function drawBall(ctx: CanvasRenderingContext2D) {
  const s = TEXTURE_SIZE;
  const cx = s / 2;
  const cy = s / 2 + 4;
  ctx.clearRect(0, 0, s, s);

  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath();
  ctx.ellipse(cx, s * 0.8, 40, 11, 0, 0, Math.PI * 2);
  ctx.fill();

  const grad = ctx.createRadialGradient(cx - 18, cy - 18, 6, cx, cy, 52);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.7, '#e2e8f0');
  grad.addColorStop(1, '#94a3b8');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, 48, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 30);
  ctx.lineTo(cx + 22, cy - 6);
  ctx.lineTo(cx + 12, cy + 24);
  ctx.lineTo(cx - 12, cy + 24);
  ctx.lineTo(cx - 22, cy - 6);
  ctx.closePath();
  ctx.stroke();
}

function drawGoal(ctx: CanvasRenderingContext2D) {
  const s = TEXTURE_SIZE;
  ctx.clearRect(0, 0, s, s);
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 8;
  ctx.strokeRect(40, 72, 176, 112);
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(40, 72);
  ctx.lineTo(40, 184);
  ctx.moveTo(216, 72);
  ctx.lineTo(216, 184);
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(226,232,240,0.45)';
  for (let i = 1; i < 5; i++) {
    const x = 40 + (176 / 5) * i;
    ctx.beginPath();
    ctx.moveTo(x, 72);
    ctx.lineTo(x, 184);
    ctx.stroke();
  }
  for (let j = 1; j < 4; j++) {
    const y = 72 + (112 / 4) * j;
    ctx.beginPath();
    ctx.moveTo(40, y);
    ctx.lineTo(216, y);
    ctx.stroke();
  }
}

function drawHurdle(ctx: CanvasRenderingContext2D) {
  const s = TEXTURE_SIZE;
  ctx.clearRect(0, 0, s, s);
  ctx.fillStyle = '#f97316';
  ctx.fillRect(48, 96, 160, 16);
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(60, 112, 12, 88);
  ctx.fillRect(184, 112, 12, 88);
}

function drawLadder(ctx: CanvasRenderingContext2D) {
  const s = TEXTURE_SIZE;
  ctx.clearRect(0, 0, s, s);
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(72, 60);
  ctx.lineTo(72, 200);
  ctx.moveTo(184, 60);
  ctx.lineTo(184, 200);
  ctx.stroke();
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 8;
  for (let i = 0; i < 6; i++) {
    const y = 68 + i * 24;
    ctx.beginPath();
    ctx.moveTo(72, y);
    ctx.lineTo(184, y);
    ctx.stroke();
  }
}

function lighten(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, ((n >> 16) & 255) + 255 * amount);
  const g = Math.min(255, ((n >> 8) & 255) + 255 * amount);
  const b = Math.min(255, (n & 255) + 255 * amount);
  return `rgb(${r | 0},${g | 0},${b | 0})`;
}

function renderMaterial(kind: MaterialKind): string {
  const canvas = document.createElement('canvas');
  canvas.width = TEXTURE_SIZE;
  canvas.height = TEXTURE_SIZE;
  const ctx = canvas.getContext('2d')!;

  switch (kind) {
    case 'player-own':
      drawPlayer(ctx, '#0ea5e9', '#0369a1', '1');
      break;
    case 'player-rival':
      drawPlayer(ctx, '#f43f5e', '#be123c', 'X');
      break;
    case 'player-neutral':
      drawPlayer(ctx, '#f59e0b', '#b45309', 'N');
      break;
    case 'cone':
      drawCone(ctx);
      break;
    case 'cone-pole':
      drawConePole(ctx);
      break;
    case 'seta':
      drawSeta(ctx);
      break;
    case 'ball':
      drawBall(ctx);
      break;
    case 'goal':
      drawGoal(ctx);
      break;
    case 'hurdle':
      drawHurdle(ctx);
      break;
    case 'ladder':
      drawLadder(ctx);
      break;
  }
  return canvas.toDataURL('image/png');
}

export async function getMaterialImage(kind: MaterialKind): Promise<HTMLImageElement> {
  if (typeof document === 'undefined') {
    throw new Error('Material assets require browser');
  }
  const key = cacheKey(kind);
  const cached = cache.get(key);
  if (cached) return cached;
  const img = await createImage(renderMaterial(kind));
  cache.set(key, img);
  return img;
}

export const MATERIAL_CATALOG: { kind: MaterialKind; label: string }[] = [
  { kind: 'player-own', label: 'Jugador' },
  { kind: 'player-rival', label: 'Rival' },
  { kind: 'player-neutral', label: 'Neutro' },
  { kind: 'cone', label: 'Cono' },
  { kind: 'cone-pole', label: 'Pica' },
  { kind: 'seta', label: 'Seta' },
  { kind: 'ball', label: 'Balón' },
  { kind: 'goal', label: 'Portería' },
  { kind: 'hurdle', label: 'Valla' },
  { kind: 'ladder', label: 'Escalera' },
];
