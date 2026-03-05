"use client";

import { useAuth } from "@/lib/auth-context";
import { DashboardSidebar } from "@/components/dashboard/Sidebar";
import { Loader2, ChevronRight } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && profile) {
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

  if (isOnboarding) {
    return (
      <div className="min-h-screen bg-[#04070c] flex">
        <main className="flex-1 p-8 overflow-y-auto relative custom-scrollbar">
          <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
          <div className="max-w-7xl mx-auto relative z-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
            {children}
          </div>
        </main>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen bg-[#04070c] flex w-full relative">
        <DashboardSidebar />

        {/* TIRADOR TÁCTICO CENTRAL (ELECTRIC CYAN) */}
        <div className="fixed left-0 top-1/2 -translate-y-1/2 z-[100] group">
          <SidebarTrigger className="h-20 w-8 rounded-r-2xl bg-primary text-black hover:w-10 transition-all cyan-glow flex items-center justify-center border-none p-0 group-hover:scale-y-110 origin-left">
             <ChevronRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
          </SidebarTrigger>
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-r-2xl -z-10 group-hover:bg-primary/40 transition-all animate-pulse" />
        </div>

        <main className="flex-1 p-8 overflow-y-auto relative custom-scrollbar">
          <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
          
          <div className="max-w-7xl mx-auto relative z-10 pt-16 lg:pt-0 animate-in fade-in slide-in-from-bottom-2 duration-700">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
