"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Script from "next/script";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { synqSync } from "@/lib/sync-service";

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT ?? "";
const ADSENSE_SLOT_H = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_HORIZONTAL ?? "";

export const PANEL_OUTER =
  "drop-shadow-[0_0_15px_rgba(6,182,212,0.1)] shadow-[0_18px_60px_rgba(0,0,0,0.45)]";

export const inputProClass =
  "h-11 rounded-none border border-white/10 bg-slate-950/45 backdrop-blur-md text-white font-bold uppercase text-xs placeholder:text-white/25 " +
  "focus-visible:border-cyan-400 focus-visible:ring-2 focus-visible:ring-cyan-400/45 focus-visible:ring-offset-0 focus-visible:shadow-[0_0_18px_rgba(34,211,238,0.25)] " +
  "transition-[border-color,box-shadow] duration-200";

export const iconCyan = "h-4 w-4 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.55)]";

export function HubPanel({ children }: { children: ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-none border border-white/10 bg-slate-900/60 backdrop-blur-md overflow-hidden",
        PANEL_OUTER,
      )}
    >
      {children}
    </div>
  );
}

export function SectionBar({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/10 bg-gradient-to-r from-cyan-500/10 via-transparent to-transparent">
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-200/85 truncate">{title}</p>
      {right}
    </div>
  );
}

export function PromoAdsPanel(props: { placement: string; sectionTitle?: string }) {
  const { placement, sectionTitle = "Monetización" } = props;
  const adRef = useRef<HTMLDivElement | null>(null);
  const refreshIntervalRef = useRef<number | null>(null);

  const pushAd = () => {
    if (!ADSENSE_CLIENT || !ADSENSE_SLOT_H) return;
    const w = window as unknown as { adsbygoogle?: unknown[] };
    if (!w.adsbygoogle) return;
    try {
      w.adsbygoogle.push({});
      synqSync.trackEvent("ad_impression", {
        app_slug: "sandbox-coach",
        source: "sandbox",
        placement,
        format: "horizontal",
      });
    } catch {
      /* noop */
    }
  };

  useEffect(() => {
    if (!ADSENSE_CLIENT || !ADSENSE_SLOT_H) return;
    if (!adRef.current) return;

    let tries = 0;
    const maxTries = 40;
    const t = window.setInterval(() => {
      tries += 1;
      const w = window as unknown as { adsbygoogle?: unknown[] };
      if (!w.adsbygoogle) {
        if (tries >= maxTries) window.clearInterval(t);
        return;
      }
      pushAd();
      window.clearInterval(t);
    }, 150);

    refreshIntervalRef.current = window.setInterval(() => {
      if (!adRef.current) return;
      adRef.current.innerHTML = "";
      const ins = document.createElement("ins");
      ins.className = "adsbygoogle";
      ins.style.display = "block";
      ins.setAttribute("data-ad-client", ADSENSE_CLIENT);
      ins.setAttribute("data-ad-slot", ADSENSE_SLOT_H);
      ins.setAttribute("data-ad-format", "horizontal");
      ins.setAttribute("data-full-width-responsive", "true");
      adRef.current.appendChild(ins);
      pushAd();
    }, 25000);

    return () => {
      window.clearInterval(t);
      if (refreshIntervalRef.current) window.clearInterval(refreshIntervalRef.current);
    };
  }, [placement]);

  const isConfigured = !!(ADSENSE_CLIENT && ADSENSE_SLOT_H);

  return (
    <HubPanel>
      <SectionBar
        title={sectionTitle}
        right={<Sparkles className="h-4 w-4 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.55)]" />}
      />
      <div className="p-4">
        {isConfigured ? (
          <Script
            id={`sandbox-promo-adsense-${placement}`}
            strategy="afterInteractive"
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(ADSENSE_CLIENT)}`}
          />
        ) : null}
        <div
          className={cn(
            "min-h-[120px] w-full overflow-hidden border border-white/10 bg-black/35",
            !isConfigured && "border-dashed",
          )}
        >
          {isConfigured ? (
            <div
              ref={adRef}
              onClick={() =>
                synqSync.trackEvent("ad_click", {
                  app_slug: "sandbox-coach",
                  source: "sandbox",
                  placement,
                  format: "horizontal",
                })
              }
            >
              <ins
                className="adsbygoogle"
                style={{ display: "block" }}
                data-ad-client={ADSENSE_CLIENT}
                data-ad-slot={ADSENSE_SLOT_H}
                data-ad-format="horizontal"
                data-full-width-responsive="true"
              />
            </div>
          ) : (
            <div className="min-h-[120px] w-full flex items-center justify-center px-4 text-center text-[9px] font-black uppercase tracking-[0.2em] text-cyan-200/70">
              Slot demo Adsense · NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT / SLOT
            </div>
          )}
        </div>
      </div>
    </HubPanel>
  );
}
