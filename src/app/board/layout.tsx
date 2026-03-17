
"use client";

import { useAuth } from "@/lib/auth-context";
import { Loader2, Maximize2, Minimize2, LayoutDashboard, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";

/**
 * Layout de Pizarra Inmersiva - v12.1.0
 * Eliminado el Sidebar para ganar el 100% del ancho.
 * Implementado botón de retorno flotante.
 */
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
    <div className="h-[100dvh] w-full bg-[#020408] overflow-hidden relative">
      {/* BOTÓN DE RETORNO FLOTANTE (REEMPLAZA AL SIDEBAR) */}
      <div className="fixed top-6 left-6 z-[200] flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.push('/dashboard')}
          className="h-12 w-12 rounded-2xl bg-black/60 backdrop-blur-2xl border border-white/10 text-white/40 hover:text-primary hover:scale-110 transition-all shadow-2xl group"
          title="Volver al Dashboard"
        >
          <LayoutDashboard className="h-5 w-5 group-hover:animate-pulse" />
        </Button>
      </div>

      <main className="h-full w-full relative z-10 flex flex-col overflow-hidden animate-in fade-in duration-1000">
        {/* BOTÓN FULLSCREEN FLOTANTE */}
        <button 
          onClick={toggleFullscreen}
          className="fixed bottom-6 left-6 z-[200] h-14 w-14 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl flex items-center justify-center text-white/40 hover:text-primary transition-all hover:scale-110 active:scale-95 shadow-2xl group"
          title={isFullscreen ? "Salir del Modo Élite" : "Inmersión Total 4K"}
        >
          {isFullscreen ? <Minimize2 className="h-6 w-6" /> : <Maximize2 className="h-6 w-6 group-hover:animate-pulse" />}
          <div className="absolute inset-0 bg-primary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        {children}
      </main>
    </div>
  );
}
