/**
 * @fileOverview Manifiesto dinámico para la App de Tutores.
 * Permite que /tutor sea instalada como una App independiente.
 */

export const dynamic = 'force-static';

export async function GET() {
  const manifest = {
    name: "Tutor by SynqAi",
    short_name: "SynqTutor",
    description: "Portal Oficial de Familias - Red SynqAi Sports",
    id: "com.synqai.tutor.v1",
    start_url: "/tutor",
    scope: "/tutor",
    display: "standalone",
    background_color: "#04070c",
    theme_color: "#00f2ff",
    orientation: "portrait",
    icons: [
      {
        src: "https://placehold.co/192x192/04070c/00f2ff?text=Tutor",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable"
      },
      {
        src: "https://placehold.co/512x512/04070c/00f2ff?text=Tutor",
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
