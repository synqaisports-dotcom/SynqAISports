
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  Building,
  MapPin,
  UserCog,
  Sprout,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  useSidebar,
  SidebarGroup
} from "@/components/ui/sidebar";

interface NavItem {
  title: string;
  href: string;
  icon: any;
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
  { title: "Club", href: "/dashboard/club", icon: Building, category: "operational" },
  { title: "Instalaciones", href: "/dashboard/facilities", icon: MapPin, category: "operational" },
  { title: "Staff", href: "/dashboard/staff", icon: UserCog, category: "operational" },
  { title: "Cantera", href: "/dashboard/academy", icon: Sprout, category: "operational" },
  { title: "Jugadores", href: "/dashboard/players", icon: Users, category: "operational" },
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
  const router = useRouter();
  const { toggleSidebar } = useSidebar();
  const { profile, logout } = useAuth();
  
  if (pathname === "/dashboard/coach/onboarding") return null;

  const isSuperAdmin = profile?.role === "superadmin";

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <Sidebar collapsible="offcanvas" className="border-r border-white/5 bg-[#04070c] shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
      <SidebarHeader className="p-8 border-b border-white/5 bg-black/60 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-primary p-2.5 rounded-xl shrink-0 cyan-glow shadow-[0_0_25px_rgba(0,242,255,0.4)]">
              <Zap className="h-6 w-6 text-black" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="font-headline font-black text-2xl tracking-tighter text-white uppercase italic">
                Synq<span className="text-primary cyan-text-glow">AI</span>
              </span>
              <span className="text-[9px] font-black text-white/30 tracking-[0.4em] uppercase">SPORTS_PRO</span>
            </div>
          </div>
          <button 
            onClick={toggleSidebar}
            className="h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-primary transition-all border border-white/5 lg:hidden"
            title="Ocultar Terminal"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-8 space-y-10 custom-scrollbar overflow-x-hidden">
        {/* GLOBAL CONTROL - ONLY FOR SUPERADMIN */}
        {isSuperAdmin && (
          <SidebarGroupWrapper title="Control_Global" color="text-emerald-400">
            <SidebarMenu>
              {navItems.filter(i => i.category === "global").map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarLink item={item} isActive={pathname === item.href} isGlobal />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupWrapper>
        )}

        {/* OPERATIONAL ELITE */}
        <SidebarGroupWrapper title="Operativa_Elite" color="text-primary">
          <SidebarMenu>
            {navItems.filter(i => i.category === "operational").map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarLink item={item} isActive={pathname === item.href} />
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupWrapper>

        {/* USER TERMINALS */}
        <SidebarGroupWrapper title="Terminales_Acceso" color="text-white/20">
          <SidebarMenu>
            {navItems.filter(i => i.category === "user").map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarLink item={item} isActive={pathname === item.href} />
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupWrapper>
      </SidebarContent>

      <SidebarFooter className="p-6 border-t border-white/5 bg-black/60 backdrop-blur-md">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-4 px-4 py-4 text-white/30 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest hover:bg-white/5 rounded-2xl group overflow-hidden w-full text-left"
        >
          <LogOut className="h-5 w-5 shrink-0 group-hover:translate-x-1 transition-transform" />
          <span className="whitespace-nowrap font-bold">CERRAR_SESIÓN</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}

function SidebarGroupWrapper({ children, title, color }: any) {
  return (
    <SidebarGroup className="p-0">
      <p className={cn("px-4 mb-4 text-[8px] font-black uppercase tracking-[0.5em] opacity-50", color)}>
        {title}
      </p>
      {children}
    </SidebarGroup>
  );
}

function SidebarLink({ item, isActive, isGlobal }: { item: NavItem; isActive: boolean; isGlobal?: boolean }) {
  const activeClass = isGlobal 
    ? "bg-emerald-500/10 text-emerald-400 shadow-[0_4px_15px_rgba(16,185,129,0.15)] emerald-text-glow"
    : "bg-primary/10 text-primary shadow-[0_4px_15px_rgba(0,242,255,0.15)] cyan-text-glow";

  const iconClass = isGlobal 
    ? (isActive ? "text-emerald-400 scale-110" : "group-hover:text-emerald-400 group-hover:scale-110")
    : (isActive ? "text-primary scale-110" : "group-hover:text-primary group-hover:scale-110");

  return (
    <SidebarMenuButton
      asChild
      isActive={isActive}
      className={cn(
        "flex items-center gap-4 px-5 py-4 rounded-2xl transition-all relative group overflow-hidden h-12",
        isActive ? activeClass : "text-white/40 hover:text-white hover:bg-white/[0.04]"
      )}
    >
      <Link href={item.href}>
        <item.icon className={cn("h-5 w-5 shrink-0 transition-all duration-500", iconClass)} />
        <span className="font-bold text-[10px] uppercase tracking-[0.25em] whitespace-nowrap">{item.title}</span>
        {isActive && (
          <div className={cn(
            "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/5 rounded-full",
            isGlobal ? "bg-emerald-500" : "bg-primary"
          )} />
        )}
      </Link>
    </SidebarMenuButton>
  );
}
