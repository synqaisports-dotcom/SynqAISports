/**
 * Motor de escalado universal del campo deportivo.
 * Separa contenedor (viewport), rectángulo del campo (px) y geometría reglamentaria (%).
 */

import type { FieldRect, FieldTemplate } from '@/lib/exercise-drawing';

/** Dimensiones reglamentarias en metros (viewBox lógico). */
export const FIELD_VIEWBOX: Record<FieldTemplate, { width: number; height: number }> = {
  'football-full': { width: 105, height: 68 },
  'football-f7': { width: 60, height: 40 },
  'football-half': { width: 52.5, height: 68 },
  'football-third': { width: 35, height: 68 },
  futsal: { width: 40, height: 20 },
  blank: { width: 16, height: 10 },
};

/** Futsal: pista interior dentro del viewBox 40×20 m. */
export const FUTSAL_COURT_NORM = { x: 1 / 40, y: 0.5 / 20, w: 38 / 40, h: 19 / 20 };

export function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function lerpFieldRect(a: FieldRect, b: FieldRect, t: number): FieldRect {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    width: lerp(a.width, b.width, t),
    height: lerp(a.height, b.height, t),
  };
}

export function fieldRectsEqual(a: FieldRect, b: FieldRect, epsilon = 0.5): boolean {
  return (
    Math.abs(a.x - b.x) < epsilon &&
    Math.abs(a.y - b.y) < epsilon &&
    Math.abs(a.width - b.width) < epsilon &&
    Math.abs(a.height - b.height) < epsilon
  );
}

/** Convierte coordenadas normalizadas 0..1 del campo a píxeles en pantalla. */
export class FieldMapper {
  constructor(readonly rect: FieldRect) {}

  x(nx: number) {
    return this.rect.x + nx * this.rect.width;
  }

  y(ny: number) {
    return this.rect.y + ny * this.rect.height;
  }

  w(nw: number) {
    return nw * this.rect.width;
  }

  h(nh: number) {
    return nh * this.rect.height;
  }

  pt(nx: number, ny: number) {
    return { x: this.x(nx), y: this.y(ny) };
  }

  /** Sub-rectángulo normalizado dentro del campo → nuevo mapper. */
  inset(nx: number, ny: number, nw: number, nh: number) {
    return new FieldMapper({
      x: this.x(nx),
      y: this.y(ny),
      width: this.w(nw),
      height: this.h(nh),
    });
  }

  lineWidth() {
    return Math.max(1.2, Math.min(3.2, this.rect.width * 0.0018));
  }

  /** Grosor de trazo en preview SVG (viewBox en metros). */
  previewStroke(scale = 0.32) {
    const vb = Math.max(this.rect.width, this.rect.height);
    return Math.max(0.1, (vb / 105) * scale);
  }
}

/** Escala base de materiales como fracción del ancho del campo. */
export const MATERIAL_SCALE_NORM = 0.075;
