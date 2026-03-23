/**
 * @fileOverview Manifiesto dinámico para la Micro-App Sandbox.
 * Permite que el entorno de pruebas local sea instalable como un nodo independiente.
 */

export const dynamic = 'force-static';

export async function GET() {
  const manifest = {
    name: "Sandbox by SynqAi",
    short_name: "SynqSandbox",
    description: "Entorno Táctico Local y Gestión Sandbox",
    id: "com.synqai.sandbox.v1",
    start_url: "/dashboard/promo/team",
    scope: "/dashboard/promo",
    display: "standalone",
    background_color: "#04070c",
    theme_color: "#3b82f6",
    orientation: "any",
    icons: [
      {
        src: "https://placehold.co/192x192/04070c/3b82f6?text=Sandbox",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable"
      },
      {
        src: "https://placehold.co/512x512/04070c/3b82f6?text=Sandbox",
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
