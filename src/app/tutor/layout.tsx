
"use client";

import { ReactNode, useState, useEffect, createContext, useContext } from "react";
import { X, RefreshCw, Zap, CalendarDays, MessageSquareQuote, UserCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Contexto de la App de Tutores
 * Maneja el hijo seleccionado y la lógica de anuncios.
 */
interface TutorContextType {
  selectedChild: any;
  setSelectedChild: (child: any) => void;
  showAd: () => void;
}

const TutorContext = createContext<TutorContextType | null>(null);

export const useTutor = () => {
  const context = useContext(TutorContext);
  if (!context) throw new Error("useTutor must be used within TutorProvider");
  return context;
};

function NavItem({ icon: Icon, active, href = "#" }: any) {
  return (
    <Link href={href}>
      <button className={cn(
        "h-12 w-12 rounded-2xl flex items-center justify-center transition-all relative",
        active ? "bg-primary/10 text-primary" : "text-white/20 hover:text-white"
      )}>
        <Icon className="h-6 w-6" />
        {active && <div className="absolute -bottom-1 h-1 w-4 bg-primary rounded-full" />}
      </button>
    </Link>
  );
}

export default function TutorLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/tutor';

  const [selectedChild, setSelectedChild] = useState({
    id: 'c1',
    name: 'LUCAS GARCÍA',
    number: '10',
    team: 'INFANTIL A',
    category: 'FEDERADO'
  });

  const [isInterstitialVisible, setIsInterstitialVisible] = useState(false);

  // Lógica de Anuncios: Solo mostrar si han pasado 10 minutos (600000ms)
  const showAd = () => {
    const lastAd = localStorage.getItem('synq_tutor_last_ad');
    const now = Date.now();
    
    if (!lastAd || now - parseInt(lastAd) > 600000) {
      setIsInterstitialVisible(true);
      localStorage.setItem('synq_tutor_last_ad', now.toString());
    }
  };

  return (
    <TutorContext.Provider value={{ selectedChild, setSelectedChild, showAd }}>
      {/* VINCULACIÓN DE MANIFIESTO EXCLUSIVO PARA TUTORES */}
      <head>
        <link rel="manifest" href="/tutor/manifest.json" />
        <meta name="apple-mobile-web-app-title" content="Tutor by SynqAi" />
      </head>
      
      <div className="min-h-screen bg-[#04070c] flex justify-center font-body">
        <div className="w-full max-w-[500px] bg-[#020408] min-h-screen relative shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col border-x border-white/5">
          
          <div className="flex-1 flex flex-col">
            {children}
          </div>

          {/* NAVEGACIÓN INFERIOR FIJA */}
          {!isLoginPage && (
            <nav className="sticky bottom-0 h-20 bg-[#04070c]/80 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-6 z-[100] shrink-0">
              <NavItem icon={Zap} href="/tutor/dashboard" active={pathname === '/tutor/dashboard'} />
              <NavItem icon={CalendarDays} href="/tutor/calendar" active={pathname === '/tutor/calendar'} />
              <NavItem icon={MessageSquareQuote} href="/tutor/chat" active={pathname === '/tutor/chat'} />
              <NavItem icon={UserCircle} href="/tutor/id" active={pathname === '/tutor/id'} />
            </nav>
          )}

          {/* PUBLICIDAD INTERSTICIAL (BAJA FRECUENCIA) */}
          {isInterstitialVisible && (
            <div className="fixed inset-0 z-[300] bg-[#04070c] flex flex-col animate-in fade-in duration-500">
              <div className="absolute top-6 right-6">
                <button 
                  onClick={() => setIsInterstitialVisible(false)}
                  className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="flex-1 flex flex-col items-center justify-center p-10 text-center space-y-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse rounded-full" />
                  <RefreshCw className="h-20 w-20 text-primary animate-spin-slow relative z-10" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Sincronizando Patrocinador</h3>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.3em] leading-loose">
                    Gracias a nuestros aliados, mantenemos la cuota gratuita para las familias de la red SynqAI.
                  </p>
                </div>
                <div className="w-full aspect-video bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center">
                   <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Video_Ad_Container</span>
                </div>
                <button 
                  onClick={() => setIsInterstitialVisible(false)}
                  className="w-full h-16 bg-white/5 border border-white/10 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl active:scale-95 transition-all"
                >
                  Continuar a la App
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </TutorContext.Provider>
  );
}
