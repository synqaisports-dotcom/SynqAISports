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

export default async function SmartwatchLayout(props: { 
  children: ReactNode;
  params: Promise<any>;
}) {
  const params = await props.params;
  const children = props.children;

  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
