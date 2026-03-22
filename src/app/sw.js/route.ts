
/**
 * @fileOverview Service Worker para habilitar capacidades PWA.
 * Requisito indispensable para que Chrome y Android detecten la App como Instalable.
 */

export const dynamic = 'force-static';

export async function GET() {
  const swCode = `
    const CACHE_NAME = 'synqai-tutor-v1';
    
    self.addEventListener('install', (event) => {
      self.skipWaiting();
    });

    self.addEventListener('activate', (event) => {
      event.waitUntil(clients.claim());
    });

    self.addEventListener('fetch', (event) => {
      // El evento fetch es obligatorio para que el navegador muestre el prompt de instalación.
      // En este prototipo no cacheamos para permitir actualizaciones rápidas en desarrollo.
      return;
    });
  `;

  return new Response(swCode, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'no-cache',
    },
  });
}
