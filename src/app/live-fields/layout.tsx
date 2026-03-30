import type { Metadata, Viewport } from "next";
import { PwaInstallBanner } from "@/components/pwa/PwaInstallBanner";

export const viewport: Viewport = {
  themeColor: "#00f2ff",
};

export const metadata: Metadata = {
  title: "Live Fields · SynqAI",
  description: "Visualizador TV en tiempo real del estado de campos y equipos.",
  manifest: "/live-fields/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Live Fields",
  },
};

export default function LiveFieldsLayout(props: { children: React.ReactNode }) {
  return (
    <>
      <PwaInstallBanner appName="Live Fields" storageKeyScope="live-fields" />
      {props.children}
    </>
  );
}
