
"use client";

import { useAuth } from "@/lib/auth-context";
import { Loader2, LayoutDashboard } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

/**
 * Layout de Pizarra Inmersiva - v16.4.0
 * PROTOCOLO_FULLSCREEN_HEADER_INTEGRATION: Eliminado el botón flotante inferior
 * ya que se ha integrado en la cabecera central de las pizarras para mayor limpieza.
 */
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
        <p className="text-[10px] font-black text-primary tracking-[0.5em] uppercase">Sincronizando_Entorno_Táctico...</p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="h-[100dvh] w-full bg-[#020408] overflow-hidden relative">
      {/* BOTÓN DE RETORNO FLOTANTE */}
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
        {children}
      </main>
    </div>
  );
}
