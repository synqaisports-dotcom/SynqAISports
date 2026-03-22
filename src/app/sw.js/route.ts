
/**
 * @fileOverview Service Worker para habilitar capacidades PWA.
 * Requisito indispensable para que Chrome y Android detecten la App como Instalable.
 */

export const dynamic = 'force-static';

export async function GET() {
  const swCode = `
    const CACHE_NAME = 'synqai-tutor-v2';
    
    self.addEventListener('install', (event) => {
      self.skipWaiting();
    });

    self.addEventListener('activate', (event) => {
      event.waitUntil(clients.claim());
    });

    self.addEventListener('fetch', (event) => {
      // Necesario para la validación de PWA de Chrome en Android
      if (event.request.mode === 'navigate') {
        event.respondWith(fetch(event.request));
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
