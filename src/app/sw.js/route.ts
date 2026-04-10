
/**
 * @fileOverview Service Worker para habilitar capacidades PWA.
 * Requisito indispensable para que Chrome y Android detecten la App como Instalable.
 */

export const dynamic = 'force-static';

export async function GET() {
  const swCode = `
    /* Minimal service worker for SynqAI Sports.
     * - Safe offline fallback for navigation
     * - Cache core shell + manifests
     * Note: keep it simple to avoid breaking app updates.
     */

    const CACHE_NAME = "synqai-sw-v2";

    const CORE_ASSETS = [
      "/",
      "/manifest.json",
      "/tutor/manifest.json",
      "/smartwatch/manifest.json",
      "/dashboard/promo/manifest.json",
      "/dashboard/peripherals/manifest.json",
      "/sandbox/manifest.json",
      "/sandbox/app",
    ];

    self.addEventListener("install", (event) => {
      event.waitUntil(
        (async () => {
          try {
            const cache = await caches.open(CACHE_NAME);
            await cache.addAll(CORE_ASSETS);
          } catch {
            // Best-effort: no bloquear instalación.
          }
          self.skipWaiting();
        })(),
      );
    });

    self.addEventListener("activate", (event) => {
      event.waitUntil(
        (async () => {
          try {
            const keys = await caches.keys();
            await Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)));
          } catch {
            // noop
          }
          self.clients.claim();
        })(),
      );
    });

    self.addEventListener("fetch", (event) => {
      const req = event.request;
      const url = new URL(req.url);

      // Only handle same-origin requests
      if (url.origin !== self.location.origin) return;

      // Navigation requests: network first, fallback to cached "/"
      if (req.mode === "navigate") {
        event.respondWith(
          (async () => {
            try {
              return await fetch(req);
            } catch {
              const cache = await caches.open(CACHE_NAME);
              const cached = await cache.match("/");
              if (cached) return cached;
              return new Response("OFFLINE", { status: 200, headers: { "Content-Type": "text/plain" } });
            }
          })(),
        );
        return;
      }

      // Static-ish requests: cache first, then network
      if (
        url.pathname.startsWith("/_next/static/") ||
        url.pathname.endsWith(".css") ||
        url.pathname.endsWith(".js") ||
        url.pathname.endsWith(".png") ||
        url.pathname.endsWith(".jpg") ||
        url.pathname.endsWith(".jpeg") ||
        url.pathname.endsWith(".svg") ||
        url.pathname.endsWith(".webp") ||
        url.pathname.endsWith(".ico") ||
        url.pathname.endsWith(".json")
      ) {
        event.respondWith(
          (async () => {
            const cache = await caches.open(CACHE_NAME);
            const hit = await cache.match(req);
            if (hit) return hit;
            try {
              const res = await fetch(req);
              if (res.ok) cache.put(req, res.clone()).catch(() => {});
              return res;
            } catch {
              return hit || new Response("", { status: 504 });
            }
          })(),
        );
      }
    });
  `;

  return new Response(swCode, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
