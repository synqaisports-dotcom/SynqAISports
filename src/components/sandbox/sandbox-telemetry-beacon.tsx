"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { getOrCreateDeviceId } from "@/lib/local-db/database-service";

const STORAGE_KEY = "synq_sandbox_telemetry_sent_v1";
const INTERVAL_MS = 6 * 60 * 60 * 1000;

function readCountryHint(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const team = localStorage.getItem("synq_promo_team");
    if (team) {
      const j = JSON.parse(team) as { country?: string };
      const c = String(j?.country ?? "").trim();
      if (c.length >= 2) return c.slice(0, 64);
    }
  } catch {
    /* noop */
  }
  return undefined;
}

/**
 * Pulso anónimo de sesión Sandbox para mapa mundial en admin-global (Fase 4/6 outbox).
 * Sin email ni nombre de equipo; solo deviceId + país aproximado si existe en vault local.
 */
export function SandboxTelemetryBeacon() {
  const pathname = usePathname();
  const lastPath = useRef<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!pathname?.startsWith("/sandbox/app")) return;

    const now = Date.now();
    let last = 0;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) last = Number(raw) || 0;
    } catch {
      /* noop */
    }
    if (now - last < INTERVAL_MS && pathname === lastPath.current) return;
    lastPath.current = pathname;

    const deviceId = getOrCreateDeviceId();
    const countryCode = readCountryHint();
    const locale = typeof navigator !== "undefined" ? navigator.language?.slice(0, 32) : undefined;
    const timeZone = typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone?.slice(0, 128) : undefined;

    void fetch("/api/sync/telemetry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deviceId,
        kind: "sandbox_session",
        countryCode,
        locale,
        timeZone,
        path: pathname.slice(0, 512),
      }),
    })
      .then((res) => {
        if (res.ok) {
          try {
            localStorage.setItem(STORAGE_KEY, String(now));
          } catch {
            /* noop */
          }
        }
      })
      .catch(() => {
        /* offline / blocked */
      });
  }, [pathname]);

  return null;
}
