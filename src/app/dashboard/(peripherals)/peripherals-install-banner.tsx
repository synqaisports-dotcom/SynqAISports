"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { PwaInstallBanner } from "@/components/pwa/PwaInstallBanner";

export function PeripheralsInstallBanner() {
  const pathname = usePathname();

  // Solo mostrar en las dos pantallas “micro-app”
  const enabled =
    pathname === "/dashboard/mobile-continuity" || pathname === "/dashboard/watch-config";

  if (!enabled) return null;
  return <PwaInstallBanner appName="SynqAI Peripherals" />;
}

