import type { Metadata, Viewport } from "next";
import { PwaInstallBanner } from "@/components/pwa/PwaInstallBanner";

export const viewport: Viewport = {
  themeColor: "#00f2ff",
};

export const metadata: Metadata = {
  title: "Check-in Torneos · SynqAI",
  description: "Terminal móvil para check-in físico de equipos en torneo.",
  manifest: "/tournaments/checkin/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Check-in SynqAI",
  },
};

export default function TournamentsCheckinLayout(props: { children: React.ReactNode }) {
  return (
    <>
      <PwaInstallBanner appName="Check-in Torneos" storageKeyScope="tournaments-checkin" />
      {props.children}
    </>
  );
}
