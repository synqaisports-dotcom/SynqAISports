"use client";

import { useAuth } from "@/lib/auth-context";
import { DashboardSidebar } from "@/components/dashboard/Sidebar";
import { Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && profile) {
      // Si es un admin de club o coach y no ha creado su club, redirigir a onboarding
      // Excepto si ya está en la página de onboarding
      if ((profile.role === "club_admin" || profile.role === "coach") && 
          !profile.clubCreated && 
          pathname !== "/dashboard/coach/onboarding") {
        router.push("/dashboard/coach/onboarding");
      }
    }
  }, [profile, loading, pathname, router]);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#04070c]">
        <div className="relative">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
        </div>
        <p className="text-[10px] font-black text-primary tracking-[0.5em] uppercase">Sincronizando_Terminal_Elite...</p>
      </div>
    );
  }

  const isOnboarding = pathname === "/dashboard/coach/onboarding";

  return (
    <div className="min-h-screen bg-[#04070c] flex">
      {!isOnboarding && <DashboardSidebar />}
      <main className={`flex-1 ${isOnboarding ? '' : 'ml-64'} p-8 overflow-y-auto relative custom-scrollbar`}>
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
          {children}
        </div>
      </main>
    </div>
  );
}
