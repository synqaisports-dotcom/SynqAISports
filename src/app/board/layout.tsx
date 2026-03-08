
"use client";

import { useAuth } from "@/lib/auth-context";
import { DashboardSidebar } from "@/components/dashboard/Sidebar";
import { Loader2, ChevronsRight, ChevronLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

function BoardTabTrigger() {
  const { state } = useSidebar();
  const isExpanded = state === "expanded";

  return (
    <div 
      className={`fixed top-1/2 -translate-y-1/2 z-[100] transition-all duration-500 ease-in-out ${
        isExpanded ? 'left-[16rem]' : 'left-0'
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

export default function BoardLayout({ children }: { children: React.ReactNode }) {
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
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
        </div>
        <p className="text-[10px] font-black text-primary tracking-[0.5em] uppercase">Sincronizando_Terminal_Tactica...</p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen bg-[#04070c] flex w-full relative">
        <DashboardSidebar />

        <BoardTabTrigger />

        <main className="flex-1 flex flex-col overflow-hidden relative">
          <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
          <div className="flex-1 relative z-10 animate-in fade-in duration-700">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
