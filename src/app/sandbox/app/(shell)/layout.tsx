import type { Metadata, Viewport } from "next";
import { SandboxShellWithOptionalInstallBanner } from "../sandbox-shell-with-banner";

export const viewport: Viewport = {
  themeColor: "#050812",
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

export default async function SandboxAppShellLayout(props: { children: React.ReactNode }) {
  return <SandboxShellWithOptionalInstallBanner>{props.children}</SandboxShellWithOptionalInstallBanner>;
}

