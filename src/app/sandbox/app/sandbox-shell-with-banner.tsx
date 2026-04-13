"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { PwaInstallBanner } from "@/components/pwa/PwaInstallBanner";
import { SANDBOX_APP_BOARD_ROOT, SANDBOX_APP_ROOT } from "@/lib/sandbox-routes";
import { SandboxAppClientWrapper } from "./sandbox-app-client-wrapper";
import { SandboxCommandHubShell } from "./sandbox-command-hub-shell";
import { SandboxTelemetryBeacon } from "@/components/sandbox/sandbox-telemetry-beacon";

export function SandboxShellWithOptionalInstallBanner(props: { children: ReactNode }) {
  const pathname = usePathname() || "";
  const hidePwaBanner =
    pathname === SANDBOX_APP_ROOT || pathname.startsWith(`${SANDBOX_APP_BOARD_ROOT}/`);

  return (
    <SandboxAppClientWrapper>
      <SandboxTelemetryBeacon />
      {!hidePwaBanner ? <PwaInstallBanner appName="Sandbox" storageKeyScope="sandbox" /> : null}
      <SandboxCommandHubShell>{props.children}</SandboxCommandHubShell>
    </SandboxAppClientWrapper>
  );
}
