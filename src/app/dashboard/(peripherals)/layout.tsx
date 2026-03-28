import type { Metadata, Viewport } from "next";
import { PeripheralsInstallBanner } from "./peripherals-install-banner";

export const viewport: Viewport = {
  themeColor: "#00f2ff",
};

export const metadata: Metadata = {
  title: "Periféricos · SynqAi",
  description: "Continuidad, smartwatch y vínculo de dispositivos",
  manifest: "/dashboard/peripherals/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SynqAi Peripherals",
  },
  icons: {
    apple: [{ url: "https://placehold.co/192x192/04070c/00f2ff?text=Peripherals", sizes: "192x192", type: "image/png" }],
  },
};

export default async function PeripheralsLayout(props: { children: React.ReactNode }) {
  const children = props.children;
  return (
    <>
      <PeripheralsInstallBanner />
      {children}
    </>
  );
}

