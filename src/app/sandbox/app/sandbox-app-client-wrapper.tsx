"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { SynqAiSportsLogo } from "@/components/branding/SynqAiSportsLogo";
import { SANDBOX_APP_ROOT, sandboxLoginHref } from "@/lib/sandbox-routes";

export function SandboxAppClientWrapper(props: { children: ReactNode }) {
  const { profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!profile) {
      router.replace(sandboxLoginHref(SANDBOX_APP_ROOT));
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
    <div className="min-h-[100dvh] sandbox-theme">{props.children}</div>
  );
}

