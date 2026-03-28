export const dynamic = "force-static";

export async function GET() {
  const manifest = {
    name: "SynqAI Peripherals",
    short_name: "Peripherals",
    description: "Continuidad, Watch y enlace de dispositivos",
    id: "com.synqai.peripherals.v1",
    start_url: "/dashboard/mobile-continuity",
    scope: "/dashboard",
    display: "standalone",
    background_color: "#04070c",
    theme_color: "#00f2ff",
    orientation: "any",
    icons: [
      {
        src: "https://placehold.co/192x192/04070c/00f2ff?text=SYNC",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "https://placehold.co/512x512/04070c/00f2ff?text=SYNC",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };

  return new Response(JSON.stringify(manifest), {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

