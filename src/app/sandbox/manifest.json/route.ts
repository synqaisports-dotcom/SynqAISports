/**
 * @fileOverview Manifiesto dinámico para la micro-app Sandbox (guest).
 * Scope separado de /dashboard para instalación desde QR.
 */

export const dynamic = "force-static";

export async function GET() {
  const manifest = {
    name: "Sandbox by SynqAi",
    short_name: "SynqSandbox",
    description: "Demo local-first (pizarras, equipo y biblioteca) para coaches.",
    id: "com.synqai.sandbox.guest.v1",
    start_url: "/sandbox",
    scope: "/sandbox",
    display: "standalone",
    background_color: "#04070c",
    theme_color: "#00f2ff",
    orientation: "any",
    icons: [
      {
        src: "https://placehold.co/192x192/04070c/00f2ff?text=Sandbox",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "https://placehold.co/512x512/04070c/00f2ff?text=Sandbox",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };

  return new Response(JSON.stringify(manifest), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}

