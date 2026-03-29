"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { Loader2, RefreshCw } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { SynqAiSportsLogo } from "@/components/branding/SynqAiSportsLogo";
import { cn } from "@/lib/utils";

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT ?? "";
const ADSENSE_SLOT_H = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_HORIZONTAL ?? "";

function SandboxBottomAdBanner() {
  const adRef = useRef<HTMLDivElement | null>(null);
  const refreshIntervalRef = useRef<number | null>(null);

  const pushAd = () => {
    if (!ADSENSE_CLIENT || !ADSENSE_SLOT_H) return;
    const w = window as unknown as { adsbygoogle?: unknown[] };
    if (!w.adsbygoogle) return;
    try {
      w.adsbygoogle.push({});
    } catch {
      // Evita romper UI si Google bloquea un refresh puntual.
    }
  };

  useEffect(() => {
    if (!ADSENSE_CLIENT || !ADSENSE_SLOT_H) return;

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
  }, []);

  if (ADSENSE_CLIENT && ADSENSE_SLOT_H) {
    return (
      <>
        <Script
          id="sandbox-app-adsense"
          strategy="afterInteractive"
          crossOrigin="anonymous"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(ADSENSE_CLIENT)}`}
        />
        <div className="fixed bottom-3 left-3 right-3 z-[140] pointer-events-none">
          <div className="w-full rounded-2xl border border-primary/20 bg-black/70 backdrop-blur-xl p-2 shadow-[0_10px_30px_rgba(0,0,0,0.45)] pointer-events-auto">
            <div ref={adRef}>
              <ins
                className="adsbygoogle"
                style={{ display: "block" }}
                data-ad-client={ADSENSE_CLIENT}
                data-ad-slot={ADSENSE_SLOT_H}
                data-ad-format="horizontal"
                data-full-width-responsive="true"
              />
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="fixed bottom-3 left-3 right-3 z-[140] pointer-events-none">
      <div
        className={cn(
          "h-16 w-full rounded-2xl border-2 border-dashed border-primary/25 bg-primary/10",
          "flex items-center justify-center gap-2 text-primary/70 shadow-[0_10px_30px_rgba(0,0,0,0.45)] pointer-events-auto",
        )}
      >
        <RefreshCw className="h-4 w-4 animate-spin-slow" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Ad banner demo (configura .env)</span>
      </div>
    </div>
  );
}

export function SandboxAppClientWrapper(props: { children: ReactNode }) {
  const { profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!profile) {
      const next = encodeURIComponent("/sandbox/app");
      router.replace(`/sandbox/login?next=${next}`);
    }
  }, [profile, loading, router]);

  if (loading || !profile) {
    return (
      <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-black px-6">
        <SynqAiSportsLogo compact className="mb-6" />
        <div className="relative">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
        </div>
        <p className="text-[10px] font-black text-primary tracking-[0.5em] uppercase text-center">
          Sincronizando_Sandbox...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] sandbox-theme pb-24">
      {props.children}
      <SandboxBottomAdBanner />
    </div>
  );
}

