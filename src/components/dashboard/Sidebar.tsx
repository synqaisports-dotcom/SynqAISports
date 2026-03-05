"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Zap, 
  LayoutDashboard, 
  Building2, 
  Users, 
  BrainCircuit, 
  Settings,
  Activity,
  Monitor,
  Watch,
  UserCircle,
  BarChart3,
  TicketPercent,
  LogOut,
  ShieldCheck,
  UserPlus
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  category: "global" | "operational" | "user";
}

const navItems: NavItem[] = [
  // GLOBAL CONTROL (Admin Global)
  { title: "Dashboard", href: "/admin-global", icon: LayoutDashboard, category: "global" },
  { title: "Gestión Clubes", href: "/admin-global/clubs", icon: Building2, category: "global" },
  { title: "Gestión Planes", href: "/admin-global/plans", icon: TicketPercent, category: "global" },
  { title: "Promos AI", href: "/admin-global/promos", icon: Zap, category: "global" },
  { title: "Gen. Usuarios", href: "/admin-global/users", icon: UserPlus, category: "global" },
  { title: "Analitics Global", href: "/admin-global/analytics", icon: BarChart3, category: "global" },
  
  // OPERATIONAL
  { title: "Coach Hub", href: "/coach", icon: BrainCircuit, category: "operational" },
  { title: "Tactical Board", href: "/board", icon: Monitor, category: "operational" },
  { title: "Club Admin", href: "/admin", icon: ShieldCheck, category: "operational" },
  { title: "Analytics Hub", href: "/analytics", icon: Activity, category: "operational" },
  
  // USER ACCESS
  { title: "Tutor Portal", href: "/tutor", icon: UserCircle, category: "user" },
  { title: "Smartwatch Link", href: "/smartwatch", icon: Watch, category: "user" },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-background border-r border-white/5 w-64 fixed left-0 top-0 z-30">
      <div className="p-8 flex items-center gap-3 border-b border-white/5">
        <div className="bg-primary p-2 rounded-sm rotate-45 cyan-glow">
          <Zap className="h-5 w-5 text-primary-foreground -rotate-45" />
        </div>
        <span className="font-headline font-black text-xl tracking-tighter text-white uppercase italic">
          SYNQ<span className="text-primary">AI</span>
        </span>
      </div>

      <div className="flex-1 px-4 py-8 space-y-8 overflow-y-auto custom-scrollbar">
        <div>
          <p className="px-3 mb-4 text-[8px] font-black uppercase tracking-[0.4em] text-white/20">Control_Global</p>
          <div className="space-y-1">
            {navItems.filter(i => i.category === "global").map((item) => (
              <SidebarLink key={item.href} item={item} isActive={pathname === item.href} />
            ))}
          </div>
        </div>

        <div>
          <p className="px-3 mb-4 text-[8px] font-black uppercase tracking-[0.4em] text-white/20">Operativa_Elite</p>
          <div className="space-y-1">
            {navItems.filter(i => i.category === "operational").map((item) => (
              <SidebarLink key={item.href} item={item} isActive={pathname === item.href} />
            ))}
          </div>
        </div>

        <div>
          <p className="px-3 mb-4 text-[8px] font-black uppercase tracking-[0.4em] text-white/20">Terminales_Acceso</p>
          <div className="space-y-1">
            {navItems.filter(i => i.category === "user").map((item) => (
              <SidebarLink key={item.href} item={item} isActive={pathname === item.href} />
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-white/5 bg-black/20">
        <Link href="/" className="flex items-center gap-4 w-full px-4 py-3 text-white/20 hover:text-white transition-all font-bold text-[10px] uppercase tracking-widest">
          <LogOut className="h-4 w-4" /> SALIR_A_INICIO
        </Link>
      </div>
    </div>
  );
}

function SidebarLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-4 px-4 py-3 rounded-none transition-all relative group",
        isActive 
          ? "bg-primary/10 text-primary border-l-2 border-primary" 
          : "text-white/40 hover:text-white hover:bg-white/5"
      )}
    >
      <item.icon className={cn(
        "h-4 w-4",
        isActive ? "text-primary cyan-text-glow" : "group-hover:text-primary transition-colors"
      )} />
      <span className="font-bold text-[9px] uppercase tracking-[0.2em]">{item.title}</span>
    </Link>
  );
}
