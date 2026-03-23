"use client";

import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";

export function PromoClientWrapper({ children }: { children: ReactNode }) {
  const { profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !profile) {
      router.push("/login");
    }
  }, [profile, loading, router]);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
        <div className="relative">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
        </div>
        <p className="text-[10px] font-black text-primary tracking-[0.5em] uppercase">Sincronizando_Sandbox_Terminal...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen sandbox-theme">
      {children}
    </div>
  );
}
