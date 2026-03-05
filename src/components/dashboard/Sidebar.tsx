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
  Fingerprint,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  useSidebar,
  SidebarTrigger
} from "@/components/ui/sidebar";

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
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  
  if (pathname === "/dashboard/coach/onboarding") return null;

  return (
    <Sidebar collapsible="icon" className="border-r border-white/5 bg-[#04070c] shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
      {/* LOGO SECTION */}
      <SidebarHeader className="p-4 border-b border-white/5 bg-black/60 backdrop-blur-md">
        <div className="flex items-center justify-between gap-2 overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-xl cyan-glow shadow-[0_0_20px_rgba(0,242,255,0.4)]">
              <Zap className="h-5 w-5 text-black" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col animate-in fade-in duration-500">
                <span className="font-headline font-black text-xl tracking-tighter text-white uppercase italic">
                  Synq<span className="text-primary cyan-text-glow">AI</span>
                </span>
                <span className="text-[8px] font-black text-white/30 tracking-[0.4em] uppercase">SPORTS_PRO</span>
              </div>
            )}
          </div>
          <SidebarTrigger className="text-white/40 hover:text-primary hover:bg-white/5" />
        </div>
      </SidebarHeader>

      {/* NAVIGATION SECTIONS */}
      <SidebarContent className="px-2 py-6 space-y-8 custom-scrollbar overflow-x-hidden">
        {/* GLOBAL CONTROL */}
        <SidebarGroupWrapper title="Control_Global" isCollapsed={isCollapsed} color="text-emerald-400">
          <SidebarMenu>
            {navItems.filter(i => i.category === "global").map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarLink item={item} isActive={pathname === item.href} isGlobal isCollapsed={isCollapsed} />
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupWrapper>

        {/* OPERATIONAL ELITE */}
        <SidebarGroupWrapper title="Operativa_Elite" isCollapsed={isCollapsed} color="text-primary">
          <SidebarMenu>
            {navItems.filter(i => i.category === "operational").map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarLink item={item} isActive={pathname === item.href} isCollapsed={isCollapsed} />
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupWrapper>

        {/* USER TERMINALS */}
        <SidebarGroupWrapper title="Terminales_Acceso" isCollapsed={isCollapsed} color="text-white/20">
          <SidebarMenu>
            {navItems.filter(i => i.category === "user").map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarLink item={item} isActive={pathname === item.href} isCollapsed={isCollapsed} />
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupWrapper>
      </SidebarContent>

      {/* FOOTER ACTIONS */}
      <SidebarFooter className="p-4 border-t border-white/5 bg-black/60 backdrop-blur-md">
        <Link href="/" className={cn(
          "flex items-center gap-4 px-3 py-3 text-white/30 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest hover:bg-white/5 rounded-2xl group overflow-hidden",
          isCollapsed && "justify-center px-0"
        )}>
          <LogOut className="h-4 w-4 shrink-0 group-hover:translate-x-1 transition-transform" />
          {!isCollapsed && <span className="animate-in fade-in duration-500">SALIR_A_INICIO</span>}
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}

function SidebarGroupWrapper({ children, title, isCollapsed, color }: any) {
  return (
    <div className="space-y-2">
      {!isCollapsed && (
        <p className={cn("px-4 mb-3 text-[8px] font-black uppercase tracking-[0.4em] animate-in fade-in duration-500", color)}>
          {title}
        </p>
      )}
      {children}
    </div>
  );
}

function SidebarLink({ item, isActive, isGlobal, isCollapsed }: { item: NavItem; isActive: boolean; isGlobal?: boolean; isCollapsed: boolean }) {
  const activeClass = isGlobal 
    ? "bg-emerald-500/10 text-emerald-400 shadow-[0_4px_12px_rgba(16,185,129,0.1)] emerald-text-glow"
    : "bg-primary/10 text-primary shadow-[0_4px_12px_rgba(0,242,255,0.1)] cyan-text-glow";

  const iconClass = isGlobal 
    ? (isActive ? "text-emerald-400 scale-110" : "group-hover:text-emerald-400 group-hover:scale-110")
    : (isActive ? "text-primary scale-110" : "group-hover:text-primary group-hover:scale-110");

  return (
    <SidebarMenuButton
      asChild
      isActive={isActive}
      className={cn(
        "flex items-center gap-4 px-4 py-3 rounded-2xl transition-all relative group overflow-hidden h-11",
        isActive ? activeClass : "text-white/40 hover:text-white hover:bg-white/[0.03]",
        isCollapsed && "justify-center px-0"
      )}
      tooltip={isCollapsed ? item.title : undefined}
    >
      <Link href={item.href}>
        <item.icon className={cn("h-4 w-4 shrink-0 transition-all duration-500", iconClass)} />
        {!isCollapsed && <span className="font-bold text-[9px] uppercase tracking-[0.2em] animate-in fade-in duration-500">{item.title}</span>}
        {isActive && !isCollapsed && (
          <div className={cn(
            "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 rounded-full",
            isGlobal ? "bg-emerald-500" : "bg-primary"
          )} />
        )}
      </Link>
    </SidebarMenuButton>
  );
}
