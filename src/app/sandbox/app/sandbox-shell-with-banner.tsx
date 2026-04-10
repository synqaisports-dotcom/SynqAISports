"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { PwaInstallBanner } from "@/components/pwa/PwaInstallBanner";
import { SandboxAppClientWrapper } from "./sandbox-app-client-wrapper";
import { SandboxCommandHubShell } from "./sandbox-command-hub-shell";

export function SandboxShellWithOptionalInstallBanner(props: { children: ReactNode }) {
  const pathname = usePathname() || "";
  const hidePwaBanner = pathname === "/sandbox/app" || pathname.startsWith("/sandbox/app/board/");

  return (
    <>
      {!hidePwaBanner ? <PwaInstallBanner appName="Sandbox" storageKeyScope="sandbox" /> : null}
      <SandboxAppClientWrapper>
        <SandboxCommandHubShell>{props.children}</SandboxCommandHubShell>
      </SandboxAppClientWrapper>
    </>
  );
}
