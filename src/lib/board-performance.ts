/**
 * Preferencias de rendimiento compartidas por pizarras (training / promo / match).
 */

export const BOARD_HIGH_PERFORMANCE_KEY = "synq_board_high_performance_v1";

/** Misma pestaña (localStorage no dispara `storage` en el mismo documento). */
export const BOARD_PERF_CHANGE_EVENT = "synq_board_perf_change";

export function readBoardHighPerformance(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(BOARD_HIGH_PERFORMANCE_KEY) === "1";
}

export function writeBoardHighPerformance(enabled: boolean): void {
  try {
    localStorage.setItem(BOARD_HIGH_PERFORMANCE_KEY, enabled ? "1" : "0");
  } catch {
    /* noop */
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(BOARD_PERF_CHANGE_EVENT));
  }
}

/**
 * Equipos modestos / tablets económicas. No usar `hardwareConcurrency <= 8` (penaliza hardware moderno).
 */
export function inferWeakDevice(nav: Navigator | undefined = typeof navigator !== "undefined" ? navigator : undefined): boolean {
  if (!nav) return false;
  const ua = nav.userAgent || "";

  const knownBudgetTablet =
    /AGS2|AGS3|JDN2|MediaPad\s*T5|MediaPad\s*T3|Honor\s*Tab|Honor\s*Tablet|BTV-|SHT-|KOB2|KOB-L09/i.test(ua);

  const cores = nav.hardwareConcurrency ?? 8;
  const veryLowThreadCount = cores <= 4;

  const mem = (nav as Navigator & { deviceMemory?: number }).deviceMemory;
  const lowRam = typeof mem === "number" && mem <= 3;

  const saveData = (nav as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;

  return knownBudgetTablet || veryLowThreadCount || lowRam || saveData;
}

export type BoardVisualProfile = {
  /** Modo activado manualmente por el usuario (Modo Alto Rendimiento). */
  userHighPerformance: boolean;
  /** Heurística automática (tablet modesta, poca RAM, ahorro de datos…). */
  weakDevice: boolean;
  /** `perf-lite` en contenedor (anula backdrop-blur en paneles glass). */
  perfLite: boolean;
  /** Factor aplicado al tamaño interno del canvas × DPR (training/promo). */
  renderScale: number;
  /** Sombras costosas en canvas (jugador, sombra bajo balón). */
  canvasShadows: boolean;
};

export function resolveBoardVisualProfile(dpr: number): BoardVisualProfile {
  const dprClamped = Math.min(Math.max(dpr, 1), 2);
  const userHighPerformance = readBoardHighPerformance();
  const weakDevice = inferWeakDevice();
  const perfLite = userHighPerformance || weakDevice;
  const useReducedScale = userHighPerformance || weakDevice;
  const renderScale = useReducedScale ? 0.75 * dprClamped : 1.0 * dprClamped;
  const canvasShadows = !(userHighPerformance || weakDevice);

  return {
    userHighPerformance,
    weakDevice,
    perfLite,
    renderScale,
    canvasShadows,
  };
}

export type RedrawRafHandle = {
  schedule: () => void;
  flush: () => void;
  cancel: () => void;
};

/** Como máximo un `redraw` por frame de animación. */
export function createRedrawRaf(run: () => void): RedrawRafHandle {
  let id: number | null = null;
  const tick = () => {
    id = null;
    run();
  };
  return {
    schedule() {
      if (id != null) return;
      id = requestAnimationFrame(tick);
    },
    flush() {
      if (id != null) {
        cancelAnimationFrame(id);
        id = null;
      }
      run();
    },
    cancel() {
      if (id != null) {
        cancelAnimationFrame(id);
        id = null;
      }
    },
  };
}
