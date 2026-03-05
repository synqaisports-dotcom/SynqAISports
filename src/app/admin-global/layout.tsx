"use client";

import { useAuth } from "@/lib/auth-context";
import { DashboardSidebar } from "@/components/dashboard/Sidebar";
import { Loader2, ChevronsRight, ChevronLeft, ShieldAlert } from "lucide-react";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

function GlobalTabTrigger() {
  const { state } = useSidebar();
  const isExpanded = state === "expanded";

  return (
    <div 
      className={`fixed top-1/2 -translate-y-1/2 z-[100] transition-all duration-300 ease-in-out ${
        isExpanded ? 'left-[16rem]' : 'left-0'
      }`}
    >
      <SidebarTrigger className="h-24 w-6 rounded-r-xl bg-emerald-500 text-black hover:w-8 transition-all shadow-[0_0_30px_rgba(16,185,129,0.5)] flex items-center justify-center border-none p-0 group">
         {isExpanded ? (
           <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
         ) : (
           <ChevronsRight className="h-5 w-5 animate-pulse text-black" />
         )}
      </SidebarTrigger>
      <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-r-xl -z-10 animate-pulse" />
    </div>
  );
}

export default function AdminGlobalLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && profile && profile.role !== "superadmin") {
      router.push("/dashboard");
    }
  }, [profile, loading, router]);

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

  if (profile?.role !== "superadmin") {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#04070c] p-8 text-center">
        <ShieldAlert className="h-16 w-16 text-rose-500 mb-6" />
        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">ACCESO_DENEGADO</h2>
        <p className="text-white/40 font-bold uppercase text-[10px] tracking-widest mb-8">No tiene privilegios para acceder al Núcleo Global.</p>
        <Button onClick={() => router.push("/dashboard")} className="bg-primary text-black font-black uppercase text-[10px] tracking-widest px-8 h-12">
          Volver a mi Nodo
        </Button>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen bg-[#04070c] flex admin-global-theme w-full relative">
        <DashboardSidebar />
        
        <GlobalTabTrigger />

        <main className="flex-1 p-8 lg:p-12 overflow-y-auto relative custom-scrollbar">
          <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
          
          <div className="max-w-[1600px] mx-auto relative z-10 pt-16 lg:pt-0 animate-in fade-in slide-in-from-bottom-2 duration-700">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
