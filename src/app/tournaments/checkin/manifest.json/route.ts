export const dynamic = "force-static";

export async function GET() {
  const manifest = {
    name: "SynqAI Check-in Terminal",
    short_name: "CheckIn",
    description: "Terminal móvil de check-in para torneos SynqAI.",
    id: "com.synqai.tournaments.checkin.v1",
    start_url: "/tournaments/checkin",
    scope: "/tournaments/checkin",
    display: "standalone",
    background_color: "#04070c",
    theme_color: "#00f2ff",
    orientation: "portrait",
    icons: [
      {
        src: "https://placehold.co/192x192/04070c/00f2ff?text=Check",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "https://placehold.co/512x512/04070c/00f2ff?text=Check",
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
