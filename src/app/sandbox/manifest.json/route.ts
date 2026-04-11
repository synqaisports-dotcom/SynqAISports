/**
 * @fileOverview Manifiesto dinámico para la micro-app Sandbox (guest).
 * Scope separado de /dashboard para instalación desde QR.
 */

export const dynamic = "force-static";

export async function GET() {
  const manifest = {
    name: "SynqAI Sandbox Coach",
    short_name: "Sandbox Coach",
    description: "Command hub, equipo, agenda y pizarra táctica (micro-app /sandbox/app).",
    // Nuevo id para que el navegador no reutilice una PWA antigua con start_url incorrecto.
    id: "com.synqai.sandbox.coach.v2",
    start_url: "/sandbox/app",
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

