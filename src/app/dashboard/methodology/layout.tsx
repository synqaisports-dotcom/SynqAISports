"use client";

import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MethodologyLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !profile) {
      router.push("/login");
    }
  }, [profile, loading, router]);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#04070c]">
        <div className="relative">
          <Loader2 className="h-12 w-12 text-amber-500 animate-spin mb-4" />
          <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full animate-pulse" />
        </div>
        <p className="text-[10px] font-black text-amber-500 tracking-[0.5em] uppercase">Sincronizando_Terminal_Metodologico...</p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="methodology-theme min-h-screen">
      {children}
    </div>
  );
}