import type { Metadata, Viewport } from "next";
import { PwaInstallBanner } from "@/components/pwa/PwaInstallBanner";
import { SandboxAppClientWrapper } from "../sandbox-app-client-wrapper";
import { SandboxBoardShell } from "./sandbox-board-shell";

export const viewport: Viewport = {
  themeColor: "#00f2ff",
};

export const metadata: Metadata = {
  title: "Sandbox · Pizarras",
  description: "Pizarras dentro del scope /sandbox (full-screen)",
  manifest: "/sandbox/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SynqAi Sandbox",
  },
};

export default async function SandboxBoardLayout(props: { children: React.ReactNode }) {
  return (
    <>
      <PwaInstallBanner appName="Sandbox" storageKeyScope="sandbox" />
      <SandboxAppClientWrapper>
        <SandboxBoardShell>{props.children}</SandboxBoardShell>
      </SandboxAppClientWrapper>
    </>
  );
}

