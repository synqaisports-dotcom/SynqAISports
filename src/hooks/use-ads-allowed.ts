"use client";

import { usePathname } from "next/navigation";
import { shouldAllowAdsenseWeb } from "@/lib/ads-policy";

/** True solo en rutas donde la política permite cargar AdSense en web. */
export function useAdsAllowed(): boolean {
  const pathname = usePathname() ?? "";
  return shouldAllowAdsenseWeb(pathname);
}
