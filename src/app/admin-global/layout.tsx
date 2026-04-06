"use client";

import { useAuth } from "@/lib/auth-context";
import { DashboardSidebar } from "@/components/dashboard/Sidebar";
import { Loader2, ChevronsRight, ChevronLeft, ShieldAlert, LogOut, Zap, Menu } from "lucide-react";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ClubAccessMatrixProvider } from "@/contexts/club-access-matrix-context";

function GlobalMobileHeader() {
  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#04070c]/80 backdrop-blur-xl border-b border-emerald-500/20 z-40 flex items-center px-6 justify-between">
      <div className="flex items-center gap-3">
        <div className="p-1.5 rounded-lg bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
          <Zap className="h-4 w-4 text-black animate-pulse" />
        </div>
        <span className="font-headline font-black text-lg tracking-tighter text-white uppercase italic">
          Synq<span className="text-emerald-400">AI</span>
        </span>
      </div>
      <SidebarTrigger className="h-10 w-10 text-emerald-400 border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 rounded-xl flex items-center justify-center">
         <Menu className="h-5 w-5" />
      </SidebarTrigger>
    </div>
  );
}

function GlobalTabTrigger() {
  const { state } = useSidebar();
  const isExpanded = state === "expanded";

  return (
    <div 
      className={`fixed top-1/2 -translate-y-1/2 z-[100] transition-[background-color,border-color,color,opacity,transform] duration-700 ease-in-out hidden lg:block ${
        isExpanded ? 'left-[16rem]' : 'left-[0rem]'
      }`}
    >
      <SidebarTrigger className="h-14 w-6 rounded-r-2xl border-y border-r border-emerald-500/30 bg-black/60 backdrop-blur-xl text-emerald-400 hover:w-8 hover:bg-emerald-500 hover:text-black transition-[background-color,border-color,color,opacity,transform] duration-300 opacity-0 hover:opacity-100 shadow-[0_0_20px_rgba(16,185,129,0.2)] flex items-center justify-center border-l-0 p-0 group overflow-hidden">
         {isExpanded ? (
           <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
         ) : (
           <ChevronsRight className="h-4 w-4 animate-pulse" />
         )}
         <div className="absolute inset-0 bg-emerald-500/5 scan-line opacity-20" />
      </SidebarTrigger>
    </div>
  );
}

export default function AdminGlobalLayout(props: { children: React.ReactNode }) {
  const children = props.children;
  const { profile, loading, logout } = useAuth();
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
          <Loader2 className="h-12 w-12 text-emerald-500 animate-spin mb-4" />
          <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full animate-pulse" />
        </div>
        <p className="text-[10px] font-black text-emerald-400 tracking-[0.5em] uppercase">Sincronizando_Terminal_Global...</p>
      </div>
    );
  }

  // Si no hay perfil, el useEffect redirigirá, pero mientras tanto no mostramos nada
  if (!profile) return null;

  if (profile.role !== "superadmin") {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background p-8 text-center">
        <ShieldAlert className="h-16 w-16 text-rose-500 mb-6" />
        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">ACCESO_DENEGADO</h2>
        <p className="text-white/40 font-bold uppercase text-[10px] tracking-widest mb-8">No tiene privilegios para acceder al Núcleo Global con esta identidad.</p>
        <div className="flex flex-col gap-4">
          <Button onClick={() => router.push("/dashboard")} className="bg-primary text-black font-black uppercase text-[10px] tracking-widest px-8 h-12">
            Volver a mi Nodo de Club
          </Button>
          <Button variant="ghost" onClick={() => { logout(); router.push("/login"); }} className="text-rose-400 hover:text-rose-300 font-black uppercase text-[9px] tracking-widest">
            <LogOut className="h-3 w-3 mr-2" /> Cerrar Sesión y Cambiar de Perfil
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ClubAccessMatrixProvider>
      <SidebarProvider defaultOpen={true}>
        <div className="min-h-screen bg-background flex admin-global-theme w-full relative">
          <DashboardSidebar />

          <GlobalTabTrigger />
          <GlobalMobileHeader />

          <main className="flex-1 p-8 lg:p-12 overflow-y-auto relative custom-scrollbar">
            <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

            <div className="max-w-[1600px] mx-auto relative z-10 pt-16 lg:pt-0 animate-in fade-in slide-in-from-bottom-2 duration-700">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </ClubAccessMatrixProvider>
  );
}
