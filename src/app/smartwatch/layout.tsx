import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Smartwatch by SynqAi",
  description: "Telemetría y Control de Partido - Nodo Periférico",
  manifest: "/smartwatch/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Smartwatch by SynqAi"
  }
};

/**
 * Layout exclusivo para la App de Smartwatch.
 */
export default function SmartwatchLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#04070c]">
      {children}
    </div>
  );
}
