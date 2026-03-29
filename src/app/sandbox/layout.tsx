import type { Metadata, Viewport } from "next";
import { PwaInstallBanner } from "@/components/pwa/PwaInstallBanner";

export const viewport: Viewport = {
  themeColor: "#00f2ff",
};

export const metadata: Metadata = {
  title: "Sandbox · SynqAi",
  description: "Demo local-first (pizarras, equipo y biblioteca) para coaches.",
  manifest: "/sandbox/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SynqAi Sandbox",
  },
  icons: {
    apple: [{ url: "https://placehold.co/192x192/04070c/00f2ff?text=Sandbox", sizes: "192x192", type: "image/png" }],
  },
};

export default async function SandboxLayout(props: { children: React.ReactNode }) {
  return (
    <>
      <PwaInstallBanner appName="Sandbox" storageKeyScope="sandbox" />
      {props.children}
    </>
  );
}

