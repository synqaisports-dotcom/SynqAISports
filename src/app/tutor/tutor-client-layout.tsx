
"use client";

import { ReactNode, useState, createContext, useContext, useEffect, useCallback, useRef } from "react";
import { X, RefreshCw, Zap, CalendarDays, MessageSquareQuote, UserCircle, Loader2, ShieldAlert } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LEGACY_PLAYERS_STORAGE_KEY, PLAYERS_STORAGE_PREFIX, readPlayersLocalAcrossClubs } from "@/lib/player-storage";

const ADMIN_EMAILS = ['munozmartinez.ismael@gmail.com', 'synqaisports@gmail.com', 'admin@synqai.sports'];

/**
 * Contexto de la App de Tutores - v1.6.0
 * PROTOCOLO_STABLE_SYNC: Implementada comparación de identidad para evitar bucles infinitos.
 */
interface TutorContextType {
  selectedChild: any;
  setSelectedChild: (child: any) => void;
  showAd: () => void;
  allChildren: any[];
  loading: boolean;
  refreshData: () => void;
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
        "h-12 w-12 rounded-2xl flex items-center justify-center transition-[background-color,border-color,color,opacity,transform] relative",
        active ? "bg-primary/10 text-primary shadow-[0_0_15px_rgba(0,242,255,0.1)]" : "text-white/20 hover:text-white"
      )}>
        <Icon className="h-6 w-6" />
        {active && <div className="absolute -bottom-1 h-1 w-4 bg-primary rounded-full" />}
      </button>
    </Link>
  );
}

export function TutorClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/tutor';
  const isOnboardingPage = pathname === '/tutor/onboarding';

  const [allChildren, setAllChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isInterstitialVisible, setIsInterstitialVisible] = useState(false);
  
  // Ref para evitar bucles de sincronización si los datos no han cambiado
  const lastSyncDataRef = useRef<string>("");

  const syncData = useCallback(() => {
    if (isLoginPage || isOnboardingPage) {
      setLoading(false);
      return;
    }

    const tutorEmail = localStorage.getItem("synq_tutor_session_email");
    if (!tutorEmail) {
      router.push("/tutor");
      return;
    }

    const emailLower = tutorEmail.toLowerCase();
    const isRootAdmin = ADMIN_EMAILS.includes(emailLower);
    const savedPlayers = readPlayersLocalAcrossClubs();
    
    let myAtletas = savedPlayers.filter((p: any) => 
      p.tutorEmail?.toLowerCase() === emailLower || (isRootAdmin && !p.tutorEmail)
    ).map((p: any) => ({
      id: p.id,
      name: `${p.name} ${p.surname}`.toUpperCase(),
      number: p.number || "00",
      team: `${p.category || 'S/C'} ${p.teamSuffix || ''}`.toUpperCase(),
      category: p.category || 'SIN_ASIGNAR',
      status: p.status || 'Active'
    }));

    if (isRootAdmin && myAtletas.length === 0) {
      myAtletas = [{
        id: "root-auditor",
        name: "MASTER_AUDITOR",
        number: "00",
        team: "TODOS_LOS_EQUIPOS",
        category: "ROOT_ACCESS",
        status: 'Active'
      }];
    }

    // BREAK_LOOP: Solo actualizar si los datos han cambiado realmente
    const currentDataStr = JSON.stringify(myAtletas);
    if (currentDataStr !== lastSyncDataRef.current) {
      lastSyncDataRef.current = currentDataStr;
      setAllChildren(myAtletas);
      
      setSelectedChild((current: any) => {
        const found = myAtletas.find((c: any) => c.id === current?.id);
        if (!current || !found) return myAtletas[0] || null;
        return found;
      });
    }
    
    setLoading(false);
  }, [isLoginPage, isOnboardingPage, router]);

  useEffect(() => {
    syncData();
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'synq_tutor_session_email') syncData();
      const k = e.key ?? "";
      if (k === LEGACY_PLAYERS_STORAGE_KEY || k.startsWith(`${PLAYERS_STORAGE_PREFIX}_`)) syncData();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [syncData]);

  const showAd = () => {
    const tutorEmail = localStorage.getItem("synq_tutor_session_email");
    if (tutorEmail && ADMIN_EMAILS.includes(tutorEmail.toLowerCase())) return;
    const lastAd = localStorage.getItem('synq_tutor_last_ad');
    const now = Date.now();
    if (!lastAd || now - parseInt(lastAd) > 600000) {
      setIsInterstitialVisible(true);
      localStorage.setItem('synq_tutor_last_ad', now.toString());
    }
  };

  if (loading && !isLoginPage && !isOnboardingPage) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background p-10 text-center space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Sincronizando_Nodo_Familia...</p>
      </div>
    );
  }

  return (
    <TutorContext.Provider value={{ 
      selectedChild, 
      setSelectedChild, 
      showAd, 
      allChildren, 
      loading,
      refreshData: syncData
    }}>
      <div className="w-full max-w-[500px] bg-background min-h-screen relative shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col border-x border-white/5">
        <div className="flex-1 flex flex-col">
          {children}
        </div>
        {!isLoginPage && !isOnboardingPage && (
          <nav className="sticky bottom-0 h-20 bg-card/80 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-6 z-[100] shrink-0">
            <NavItem icon={Zap} href="/tutor/dashboard" active={pathname === '/tutor/dashboard'} />
            <NavItem icon={CalendarDays} href="/tutor/calendar" active={pathname === '/tutor/calendar'} />
            <NavItem icon={MessageSquareQuote} href="/tutor/chat" active={pathname === '/tutor/chat'} />
            <NavItem icon={UserCircle} href="/tutor/id" active={pathname === '/tutor/id'} />
          </nav>
        )}
        {isInterstitialVisible && (
          <div className="fixed inset-0 z-[300] bg-background flex flex-col animate-in fade-in duration-500">
            <div className="absolute top-6 right-6">
              <button onClick={() => setIsInterstitialVisible(false)} className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center space-y-8">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse rounded-full" />
                <RefreshCw className="h-20 w-20 text-primary animate-spin-slow relative z-10" />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Sincronizando Patrocinador</h3>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.3em] leading-loose">Gracias a nuestros aliados, mantenemos la cuota gratuita para las familias de la red SynqAI.</p>
              </div>
              <div className="w-full aspect-video bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center">
                 <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Video_Ad_Container</span>
              </div>
              <button onClick={() => setIsInterstitialVisible(false)} className="w-full h-16 bg-white/5 border border-white/10 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl active:scale-95 transition-[background-color,border-color,color,opacity,transform]">Continuar a la App</button>
            </div>
          </div>
        )}
      </div>
    </TutorContext.Provider>
  );
}
