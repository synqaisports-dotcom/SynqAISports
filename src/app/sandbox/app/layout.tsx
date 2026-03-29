import type { Metadata, Viewport } from "next";
import { PwaInstallBanner } from "@/components/pwa/PwaInstallBanner";
import { SandboxAppClientWrapper } from "./sandbox-app-client-wrapper";
import { SandboxAppShell } from "./sandbox-app-shell";

export const viewport: Viewport = {
  themeColor: "#00f2ff",
};

export const metadata: Metadata = {
  title: "Sandbox · SynqAi",
  description: "Sandbox completo (logueado) dentro de la micro-app /sandbox",
  manifest: "/sandbox/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SynqAi Sandbox",
  },
};

export default async function SandboxAppLayout(props: { children: React.ReactNode }) {
  return (
    <>
      <PwaInstallBanner appName="Sandbox" storageKeyScope="sandbox" />
      <SandboxAppClientWrapper>
        <SandboxAppShell>{props.children}</SandboxAppShell>
      </SandboxAppClientWrapper>
    </>
  );
}

