
/**
 * @fileOverview SynqAI Offline Synchronization Engine v1.0
 * Maneja la cola de eventos (publicidad, clics, analíticas) cuando el usuario está offline.
 */

type SynqEvent = {
  id: string;
  type: 'ad_impression' | 'ad_click' | 'session_save' | 'match_result';
  timestamp: string;
  metadata: Record<string, unknown>;
};

class SyncService {
  private QUEUE_KEY = "synq_event_queue";
  private PENDING_COUNT_KEY = "synq_event_queue_pending";
  private MAX_QUEUE_SIZE = 1000;
  private syncInFlight = false;
  private readonly SYNC_ENDPOINT = process.env.NEXT_PUBLIC_AD_EVENTS_ENDPOINT ?? "/api/ads/events";
  private warnedMissingEndpoint = false;
  private warnedSyncHttp = new Set<number>();

  constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener('online', () => this.safeSyncNow());
      window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === "visible") this.safeSyncNow();
      });
    }
  }

  private safeSyncNow() {
    void this.syncNow().catch(() => {
      // Blindaje extra frente a cualquier rechazo no controlado.
    });
  }

  /**
   * Registra un evento en la cola local.
   */
  trackEvent(type: SynqEvent['type'], metadata: Record<string, unknown> = {}) {
    if (typeof window === "undefined") return;

    const event: SynqEvent = {
      id: `ev_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type,
      timestamp: new Date().toISOString(),
      metadata
    };

    const queue = this.getQueue();
    queue.push(event);
    const trimmed = queue.length > this.MAX_QUEUE_SIZE
      ? queue.slice(queue.length - this.MAX_QUEUE_SIZE)
      : queue;
    localStorage.setItem(this.QUEUE_KEY, JSON.stringify(trimmed));
    this.publishPendingCount(trimmed.length);

    if (navigator.onLine) {
      this.safeSyncNow();
    }
  }

  /**
   * Envía todos los eventos pendientes al servidor.
   */
  async syncNow() {
    try {
      if (!this || typeof (this as unknown as { getQueue?: unknown }).getQueue !== "function") return;
      if (typeof window === "undefined" || !navigator.onLine || this.syncInFlight) return;

      const queue = this.getQueue();
      if (queue.length === 0) return;

      if (!this.SYNC_ENDPOINT) {
        if (!this.warnedMissingEndpoint) {
          this.warnedMissingEndpoint = true;
          console.warn("[SyncService] NEXT_PUBLIC_AD_EVENTS_ENDPOINT no configurado. Cola retenida en local.");
        }
        return;
      }

      this.syncInFlight = true;
      console.log(`[SyncService] Sincronizando ${queue.length} eventos pendientes...`);

      const res = await fetch(this.SYNC_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          events: queue,
          sentAt: new Date().toISOString(),
          app: "synqai-sports",
        }),
      });
      if (!res.ok) {
        if (!this.warnedSyncHttp.has(res.status)) {
          this.warnedSyncHttp.add(res.status);
          let detail = "";
          try {
            detail = await res.text();
          } catch {
            detail = "";
          }
          console.warn(
            `[SyncService] syncNow HTTP ${res.status}. Cola retenida para reintento.`,
            detail ? { detail } : undefined,
          );
        }
        return;
      }
      localStorage.setItem(this.QUEUE_KEY, JSON.stringify([]));
      this.publishPendingCount(0);
      console.log(`[SyncService] Sincronización masiva completada. Facturación de anuncios asegurada.`);
    } catch {
      console.warn(`[SyncService] Error de red en sincronización diferida. Se reintentará automáticamente.`);
    } finally {
      this.syncInFlight = false;
    }
  }

  private getQueue(): SynqEvent[] {
    try {
      const parsed = JSON.parse(localStorage.getItem(this.QUEUE_KEY) || "[]") as unknown;
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((item) => !!item && typeof item === "object") as SynqEvent[];
    } catch {
      return [];
    }
  }

  getPendingCount(): number {
    if (typeof window === "undefined") return 0;
    return this.getQueue().length;
  }

  private publishPendingCount(count: number) {
    try {
      localStorage.setItem(this.PENDING_COUNT_KEY, String(count));
      window.dispatchEvent(new CustomEvent("synq:queue-pending-updated", { detail: { count } }));
    } catch {
      /* noop */
    }
  }
}

export const synqSync = new SyncService();
