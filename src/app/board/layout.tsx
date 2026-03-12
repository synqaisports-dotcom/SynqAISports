
"use client";

import { useAuth } from "@/lib/auth-context";
import { DashboardSidebar } from "@/components/dashboard/Sidebar";
import { Loader2, ChevronsRight, ChevronLeft, Maximize2, Minimize2, Menu, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

function BoardMobileHeader() {
  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-black/60 backdrop-blur-xl border-b border-primary/20 z-[100] flex items-center px-6 justify-between">
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

function BoardTabTrigger() {
  const { state } = useSidebar();
  const isExpanded = state === "expanded";

  return (
    <div 
      className={`fixed top-1/2 -translate-y-1/2 z-[100] transition-all duration-500 ease-in-out hidden lg:block ${
        isExpanded ? 'left-[16rem]' : 'left-0'
      }`}
    >
      <SidebarTrigger className="h-14 w-6 rounded-r-2xl border-y border-r border-primary/30 bg-black/60 backdrop-blur-xl text-primary hover:w-8 hover:bg-primary hover:text-black transition-all duration-300 shadow-[0_0_20px_rgba(0,242,255,0.2)] flex items-center justify-center border-l-0 p-0 group overflow-hidden">
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
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const syncFullscreenState = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", syncFullscreenState);
    syncFullscreenState();
    return () => {
      document.removeEventListener("fullscreenchange", syncFullscreenState);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn(`Fullscreen Error: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }, []);

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
        <p className="text-[10px] font-black text-primary tracking-[0.5em] uppercase">Sincronizando_Entorno_Táctico...</p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="h-[100dvh] w-full bg-[#020408] flex overflow-hidden relative">
        <DashboardSidebar />
        
        <BoardTabTrigger />
        <BoardMobileHeader />

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,242,255,0.03),transparent_70%)] pointer-events-none" />
          
          {/* PROTOCOLO_ERGONOMIA_V2.1: Reubicación de Pantalla Completa a Esquina Inferior Izquierda */}
          <button 
            onClick={toggleFullscreen}
            className="absolute bottom-6 left-6 z-[100] h-14 w-14 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl flex items-center justify-center text-white/40 hover:text-primary transition-all hover:scale-110 active:scale-95 shadow-2xl group"
            title={isFullscreen ? "Salir del Modo Élite" : "Inmersión Total 4K"}
          >
            {isFullscreen ? <Minimize2 className="h-6 w-6" /> : <Maximize2 className="h-6 w-6 group-hover:animate-pulse" />}
            <div className="absolute inset-0 bg-primary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          <div className="flex-1 relative z-10 flex flex-col overflow-hidden animate-in fade-in duration-1000 pt-16 lg:pt-0">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
