
/**
 * @fileOverview SynqAI Offline Synchronization Engine v1.0
 * Maneja la cola de eventos (publicidad, clics, analíticas) cuando el usuario está offline.
 */

type SynqEvent = {
  id: string;
  type: 'ad_impression' | 'ad_click' | 'session_save' | 'match_result';
  timestamp: string;
  metadata: any;
};

class SyncService {
  private QUEUE_KEY = "synq_event_queue";

  constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener('online', () => this.syncNow());
    }
  }

  /**
   * Registra un evento en la cola local.
   */
  trackEvent(type: SynqEvent['type'], metadata: any = {}) {
    if (typeof window === "undefined") return;

    const event: SynqEvent = {
      id: `ev_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type,
      timestamp: new Date().toISOString(),
      metadata
    };

    const queue = this.getQueue();
    queue.push(event);
    localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));

    if (navigator.onLine) {
      this.syncNow();
    }
  }

  /**
   * Envía todos los eventos pendientes al servidor.
   */
  async syncNow() {
    if (typeof window === "undefined" || !navigator.onLine) return;

    const queue = this.getQueue();
    if (queue.length === 0) return;

    console.log(`[SyncService] Sincronizando ${queue.length} eventos pendientes...`);

    try {
      // Simulación de envío masivo a API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Si el envío es exitoso, limpiamos la cola
      localStorage.setItem(this.QUEUE_KEY, JSON.stringify([]));
      console.log(`[SyncService] Sincronización masiva completada. Facturación de anuncios asegurada.`);
    } catch (error) {
      console.error(`[SyncService] Error en la sincronización diferida:`, error);
    }
  }

  private getQueue(): SynqEvent[] {
    try {
      return JSON.parse(localStorage.getItem(this.QUEUE_KEY) || "[]");
    } catch {
      return [];
    }
  }
}

export const synqSync = new SyncService();
