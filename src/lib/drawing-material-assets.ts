/** Texturas de material generadas en canvas (alta resolución, no SVG plano). */

export type MaterialKind =
  | 'player-own'
  | 'player-rival'
  | 'player-neutral'
  | 'cone'
  | 'cone-pole'
  | 'ball'
  | 'goal'
  | 'hurdle'
  | 'ladder';

const cache = new Map<MaterialKind, HTMLImageElement>();

function createImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

function drawPlayer(ctx: CanvasRenderingContext2D, fill: string, stroke: string, label: string) {
  const s = 128;
  ctx.clearRect(0, 0, s, s);
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;

  const grad = ctx.createRadialGradient(s / 2, s / 2, 8, s / 2, s / 2, 44);
  grad.addColorStop(0, lighten(fill, 0.25));
  grad.addColorStop(1, fill);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(s / 2, s / 2, 40, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.lineWidth = 3;
  ctx.strokeStyle = stroke;
  ctx.stroke();

  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.beginPath();
  ctx.arc(s / 2 - 12, s / 2 - 12, 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 36px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, s / 2, s / 2 + 2);

  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(s / 2, 18);
  ctx.lineTo(s / 2 - 14, 36);
  ctx.lineTo(s / 2 + 14, 36);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawCone(ctx: CanvasRenderingContext2D) {
  const s = 128;
  ctx.clearRect(0, 0, s, s);
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 4;
  const grad = ctx.createLinearGradient(0, 20, 0, 100);
  grad.addColorStop(0, '#fb923c');
  grad.addColorStop(1, '#c2410c');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(s / 2, 16);
  ctx.lineTo(28, 98);
  ctx.lineTo(100, 98);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.beginPath();
  ctx.ellipse(s / 2, 100, 38, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#7c2d12';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(s / 2, 16);
  ctx.lineTo(28, 98);
  ctx.stroke();
}

function drawConePole(ctx: CanvasRenderingContext2D) {
  const s = 128;
  ctx.clearRect(0, 0, s, s);
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.arc(s / 2, 22, 14, 0, Math.PI * 2);
  ctx.fill();
  const pole = ctx.createLinearGradient(58, 30, 70, 110);
  pole.addColorStop(0, '#f8fafc');
  pole.addColorStop(1, '#94a3b8');
  ctx.fillStyle = pole;
  ctx.fillRect(58, 30, 12, 82);
}

function drawBall(ctx: CanvasRenderingContext2D) {
  const s = 128;
  ctx.clearRect(0, 0, s, s);
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 4;
  const grad = ctx.createRadialGradient(48, 44, 4, 64, 64, 46);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(1, '#cbd5e1');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(s / 2, s / 2, 42, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(s / 2, 28);
  ctx.lineTo(s / 2 + 18, 50);
  ctx.lineTo(s / 2 + 10, 78);
  ctx.lineTo(s / 2 - 10, 78);
  ctx.lineTo(s / 2 - 18, 50);
  ctx.closePath();
  ctx.stroke();
}

function drawGoal(ctx: CanvasRenderingContext2D) {
  const s = 128;
  ctx.clearRect(0, 0, s, s);
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 36, 88, 56);
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(20, 36);
  ctx.lineTo(20, 92);
  ctx.moveTo(108, 36);
  ctx.lineTo(108, 92);
  ctx.stroke();
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(226,232,240,0.45)';
  for (let i = 1; i < 5; i++) {
    const x = 20 + (88 / 5) * i;
    ctx.beginPath();
    ctx.moveTo(x, 36);
    ctx.lineTo(x, 92);
    ctx.stroke();
  }
  for (let j = 1; j < 4; j++) {
    const y = 36 + (56 / 4) * j;
    ctx.beginPath();
    ctx.moveTo(20, y);
    ctx.lineTo(108, y);
    ctx.stroke();
  }
}

function drawHurdle(ctx: CanvasRenderingContext2D) {
  const s = 128;
  ctx.clearRect(0, 0, s, s);
  ctx.fillStyle = '#f97316';
  ctx.fillRect(24, 48, 80, 8);
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(30, 56, 6, 44);
  ctx.fillRect(92, 56, 6, 44);
}

function drawLadder(ctx: CanvasRenderingContext2D) {
  const s = 128;
  ctx.clearRect(0, 0, s, s);
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(36, 30);
  ctx.lineTo(36, 100);
  ctx.moveTo(92, 30);
  ctx.lineTo(92, 100);
  ctx.stroke();
  ctx.lineWidth = 4;
  for (let i = 0; i < 6; i++) {
    const y = 34 + i * 12;
    ctx.beginPath();
    ctx.moveTo(36, y);
    ctx.lineTo(92, y);
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
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  switch (kind) {
    case 'player-own':
      drawPlayer(ctx, '#06b6d4', '#0891b2', '1');
      break;
    case 'player-rival':
      drawPlayer(ctx, '#ef4444', '#b91c1c', 'X');
      break;
    case 'player-neutral':
      drawPlayer(ctx, '#a78bfa', '#7c3aed', 'N');
      break;
    case 'cone':
      drawCone(ctx);
      break;
    case 'cone-pole':
      drawConePole(ctx);
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
  const cached = cache.get(kind);
  if (cached) return cached;
  const img = await createImage(renderMaterial(kind));
  cache.set(kind, img);
  return img;
}

export const MATERIAL_CATALOG: { kind: MaterialKind; label: string }[] = [
  { kind: 'player-own', label: 'Jugador' },
  { kind: 'player-rival', label: 'Rival' },
  { kind: 'player-neutral', label: 'Neutro' },
  { kind: 'cone', label: 'Cono' },
  { kind: 'cone-pole', label: 'Pica' },
  { kind: 'ball', label: 'Balón' },
  { kind: 'goal', label: 'Portería' },
  { kind: 'hurdle', label: 'Valla' },
  { kind: 'ladder', label: 'Escalera' },
];
