export const dynamic = "force-static";

export async function GET() {
  const manifest = {
    name: "SynqAI Live Fields",
    short_name: "LiveFields",
    description: "Visualizador TV de estado de campos en tiempo real.",
    id: "com.synqai.livefields.v1",
    start_url: "/live-fields",
    scope: "/live-fields",
    display: "standalone",
    background_color: "#04070c",
    theme_color: "#00f2ff",
    orientation: "landscape",
    icons: [
      {
        src: "https://placehold.co/192x192/04070c/00f2ff?text=Live",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "https://placehold.co/512x512/04070c/00f2ff?text=Live",
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
