"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Zap, 
  LayoutDashboard, 
  Building2, 
  Cpu, 
  Activity,
  Monitor,
  Watch,
  UserCircle,
  BarChart3,
  TicketPercent,
  LogOut,
  ShieldCheck,
  UserPlus,
  Dumbbell,
  Fingerprint
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  category: "global" | "operational" | "user";
}

const navItems: NavItem[] = [
  // CONTROL_GLOBAL (Admin Global) - EMERALD THEME
  { title: "Dashboard", href: "/admin-global", icon: LayoutDashboard, category: "global" },
  { title: "Gestión Clubes", href: "/admin-global/clubs", icon: Building2, category: "global" },
  { title: "Gestión Planes", href: "/admin-global/plans", icon: TicketPercent, category: "global" },
  { title: "Gestión Roles", href: "/admin-global/roles", icon: Fingerprint, category: "global" },
  { title: "Promos AI", href: "/admin-global/promos", icon: Zap, category: "global" },
  { title: "Gen. Usuarios", href: "/admin-global/users", icon: UserPlus, category: "global" },
  { title: "Analytics Global", href: "/admin-global/analytics", icon: BarChart3, category: "global" },
  
  // OPERATIVA_ELITE - CYAN THEME
  { title: "Coach Hub", href: "/dashboard", icon: Cpu, category: "operational" },
  { title: "Tactical Board", href: "/board", icon: Monitor, category: "operational" },
  { title: "Biblioteca Táctica", href: "/dashboard/coach/exercises", icon: Dumbbell, category: "operational" },
  { title: "Neural Planner", href: "/dashboard/coach/planner", icon: Activity, category: "operational" },
  
  // TERMINALES_ACCESO
  { title: "Tutor Portal", href: "/tutor", icon: UserCircle, category: "user" },
  { title: "Smartwatch Link", href: "/smartwatch", icon: Watch, category: "user" },
  { title: "Admin Club", href: "/admin", icon: ShieldCheck, category: "user" },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  
  if (pathname === "/dashboard/coach/onboarding") return null;

  return (
    <div className="flex flex-col h-full bg-[#04070c] border-r border-white/5 w-64 fixed left-0 top-0 z-30 shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
      {/* LOGO SECTION */}
      <div className="p-8 flex flex-col gap-2 border-b border-white/5 bg-black/60 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="bg-primary p-2 rounded-xl rotate-12 cyan-glow shadow-[0_0_20px_rgba(0,242,255,0.4)] transition-transform hover:rotate-0 duration-500">
            <Zap className="h-5 w-5 text-black -rotate-12 group-hover:rotate-0 transition-transform" />
          </div>
          <span className="font-headline font-black text-2xl tracking-tighter text-white uppercase italic">
            Synq<span className="text-primary cyan-text-glow">AI</span>
          </span>
        </div>
        <span className="text-[9px] font-black text-white/30 tracking-[0.6em] uppercase ml-12">SPORTS_PRO</span>
      </div>

      {/* NAVIGATION SECTIONS */}
      <div className="flex-1 px-4 py-8 space-y-10 overflow-y-auto custom-scrollbar">
        {/* GLOBAL CONTROL */}
        <div>
          <p className="px-4 mb-5 text-[9px] font-black uppercase tracking-[0.5em] text-emerald-400 emerald-text-glow animate-pulse">Control_Global</p>
          <div className="space-y-2">
            {navItems.filter(i => i.category === "global").map((item) => (
              <SidebarLink key={item.href} item={item} isActive={pathname === item.href} isGlobal />
            ))}
          </div>
        </div>

        {/* OPERATIONAL ELITE */}
        <div>
          <p className="px-4 mb-5 text-[9px] font-black uppercase tracking-[0.5em] text-primary cyan-text-glow animate-pulse">Operativa_Elite</p>
          <div className="space-y-2">
            {navItems.filter(i => i.category === "operational").map((item) => (
              <SidebarLink key={item.href} item={item} isActive={pathname === item.href} />
            ))}
          </div>
        </div>

        {/* USER TERMINALS */}
        <div>
          <p className="px-4 mb-5 text-[9px] font-black uppercase tracking-[0.5em] text-white/20">Terminales_Acceso</p>
          <div className="space-y-2">
            {navItems.filter(i => i.category === "user").map((item) => (
              <SidebarLink key={item.href} item={item} isActive={pathname === item.href} />
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="p-6 border-t border-white/5 bg-black/60 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-4 w-full px-5 py-4 text-white/30 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest hover:bg-white/5 rounded-2xl group">
          <LogOut className="h-4 w-4 group-hover:translate-x-1 transition-transform" /> SALIR_A_INICIO
        </Link>
      </div>
    </div>
  );
}

function SidebarLink({ item, isActive, isGlobal }: { item: NavItem; isActive: boolean; isGlobal?: boolean }) {
  const activeClass = isGlobal 
    ? "bg-emerald-500/10 text-emerald-400 shadow-[0_4px_12px_rgba(16,185,129,0.1)] emerald-text-glow"
    : "bg-primary/10 text-primary shadow-[0_4px_12px_rgba(0,242,255,0.1)] cyan-text-glow";

  const iconClass = isGlobal 
    ? (isActive ? "text-emerald-400 scale-110" : "group-hover:text-emerald-400 group-hover:scale-110")
    : (isActive ? "text-primary scale-110" : "group-hover:text-primary group-hover:scale-110");

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all relative group overflow-hidden",
        isActive ? activeClass : "text-white/40 hover:text-white hover:bg-white/[0.03]"
      )}
    >
      <item.icon className={cn("h-4 w-4 transition-all duration-500", iconClass)} />
      <span className="font-bold text-[10px] uppercase tracking-[0.2em]">{item.title}</span>
      {isActive && (
        <div className={cn(
          "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 rounded-full",
          isGlobal ? "bg-emerald-500" : "bg-primary"
        )} />
      )}
    </Link>
  );
}