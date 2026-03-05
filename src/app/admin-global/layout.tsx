
"use client";

import { useAuth } from "@/lib/auth-context";
import { DashboardSidebar } from "@/components/dashboard/Sidebar";
import { Loader2, ChevronsRight, ChevronLeft } from "lucide-react";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

function GlobalTabTrigger() {
  const { state } = useSidebar();
  const isExpanded = state === "expanded";

  return (
    <div 
      className={`fixed top-1/2 -translate-y-1/2 z-[100] transition-all duration-300 ease-in-out ${
        isExpanded ? 'left-[16rem]' : 'left-0'
      }`}
    >
      <SidebarTrigger className="h-24 w-6 rounded-r-xl bg-primary text-black hover:w-8 transition-all shadow-[0_0_30px_rgba(16,185,129,0.5)] flex items-center justify-center border-none p-0 group">
         {isExpanded ? (
           <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
         ) : (
           <ChevronsRight className="h-5 w-5 animate-pulse text-black" />
         )}
      </SidebarTrigger>
      <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-r-xl -z-10 animate-pulse" />
    </div>
  );
}

export default function AdminGlobalLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#04070c]">
        <div className="relative">
          <Loader2 className="h-12 w-12 text-emerald-500 animate-spin mb-4" />
          <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full animate-pulse" />
        </div>
        <p className="text-[10px] font-black text-emerald-500 tracking-[0.5em] uppercase">Sincronizando_Terminal_Global...</p>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen bg-[#04070c] flex admin-global-theme w-full relative">
        <DashboardSidebar />
        
        <GlobalTabTrigger />

        <main className="flex-1 p-8 overflow-y-auto relative custom-scrollbar">
          <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
          
          <div className="max-w-7xl mx-auto relative z-10 pt-16 lg:pt-0 animate-in fade-in slide-in-from-bottom-2 duration-700">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
