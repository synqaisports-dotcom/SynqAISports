"use client";

import { useAuth } from "@/lib/auth-context";
import { DashboardSidebar } from "@/components/dashboard/Sidebar";
import { Loader2, ChevronsRight, ChevronLeft, Menu, Zap } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { ClubAccessMatrixProvider } from "@/contexts/club-access-matrix-context";
import { ClubRouteGuard } from "@/components/dashboard/ClubRouteGuard";

function OperationalMobileHeader() {
  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#04070c]/80 backdrop-blur-xl border-b border-primary/20 z-40 flex items-center px-6 justify-between">
      <div className="flex items-center gap-3">
        <div className="p-1.5 rounded-lg bg-primary shadow-[0_0_15px_rgba(0,242,255,0.4)]">
          <Zap className="h-4 w-4 text-black animate-pulse" />
        </div>
        <span className="font-headline font-black text-lg tracking-tighter text-white uppercase italic">
          Synq<span className="text-primary">AI</span>
        </span>
      </div>
      <SidebarTrigger className="h-10 w-10 text-primary border border-primary/20 bg-primary/5 hover:bg-primary/10 rounded-xl flex items-center justify-center">
         <Menu className="h-5 w-5" />
      </SidebarTrigger>
    </div>
  );
}

function OperationalTabTrigger() {
  const { state } = useSidebar();
  const isExpanded = state === "expanded";

  return (
    <div 
      className={`fixed top-1/2 -translate-y-1/2 z-[100] transition-all duration-700 ease-in-out hidden lg:block ${
        isExpanded ? 'left-[16rem]' : 'left-[0rem]'
      }`}
    >
      <SidebarTrigger className="h-14 w-6 rounded-r-2xl border-y border-r border-primary/30 bg-black/60 backdrop-blur-xl text-primary hover:w-8 hover:bg-primary hover:text-black transition-all duration-300 opacity-0 hover:opacity-100 shadow-[0_0_20px_rgba(0,242,255,0.2)] flex items-center justify-center border-l-0 p-0 group overflow-hidden">
         {isExpanded ? (
           <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
         ) : (
           <ChevronsRight className="h-4 w-4 animate-pulse" />
         )}
         <div className="absolute inset-0 bg-primary/5 scan-line opacity-20" />
      </SidebarTrigger>
    </div>
  );
}

export default function DashboardLayout(props: { children: React.ReactNode }) {
  const children = props.children;
  const { profile, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && profile) {
      if ((profile.role === "club_admin" || profile.role === "coach" || profile.role === "promo_coach") && 
          !profile.clubCreated && 
          pathname !== "/dashboard/coach/onboarding") {
        router.push("/dashboard/coach/onboarding");
      }
    }
  }, [profile, loading, pathname, router]);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
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
      <div className="min-h-screen bg-background flex">
        <main className="flex-1 p-8 overflow-y-auto relative custom-scrollbar">
          <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
          <div className="max-w-[1600px] mx-auto relative z-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
            {children}
          </div>
        </main>
      </div>
    );
  }

  return (
    <ClubAccessMatrixProvider>
      <SidebarProvider defaultOpen={true}>
        <div className="min-h-screen bg-background flex w-full relative">
          <DashboardSidebar />

          <OperationalTabTrigger />
          <OperationalMobileHeader />

          <main className="flex-1 p-8 lg:p-12 overflow-y-auto relative custom-scrollbar">
            <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />

            <div className="max-w-[1600px] mx-auto relative z-10 pt-16 lg:pt-0 animate-in fade-in slide-in-from-bottom-2 duration-700">
              <ClubRouteGuard>{children}</ClubRouteGuard>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </ClubAccessMatrixProvider>
  );
}
