"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { PwaInstallBanner } from "@/components/pwa/PwaInstallBanner";
import { SandboxAppClientWrapper } from "./sandbox-app-client-wrapper";
import { SandboxAppShell } from "./sandbox-app-shell";

export function SandboxShellWithOptionalInstallBanner(props: { children: ReactNode }) {
  const pathname = usePathname() || "";
  const immersiveHome = pathname === "/sandbox/app";

  return (
    <>
      {!immersiveHome ? <PwaInstallBanner appName="Sandbox" storageKeyScope="sandbox" /> : null}
      <SandboxAppClientWrapper>
        <SandboxAppShell>{props.children}</SandboxAppShell>
      </SandboxAppClientWrapper>
    </>
  );
}
