
/**
 * @fileOverview Manifiesto dinámico para la App de Smartwatch.
 * Permite que /smartwatch sea instalada como un nodo periférico independiente.
 */

export const dynamic = 'force-static';

export async function GET() {
  const manifest = {
    name: "Smartwatch by SynqAi",
    short_name: "SynqWatch",
    description: "Telemetría y Control de Partido - Nodo Periférico",
    id: "com.synqai.watch.v1",
    start_url: "/smartwatch",
    scope: "/smartwatch",
    display: "standalone",
    background_color: "#04070c",
    theme_color: "#00f2ff",
    orientation: "portrait",
    icons: [
      {
        src: "https://picsum.photos/seed/synqai-watch-pwa/192/192",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable"
      },
      {
        src: "https://picsum.photos/seed/synqai-watch-pwa/512/512",
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      }
    ]
  };

  return new Response(JSON.stringify(manifest), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
