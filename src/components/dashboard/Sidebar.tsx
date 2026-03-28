
"use client";

import React, { useState, useCallback, useEffect } from "react";
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
  Users,
  ShieldAlert,
  Settings2,
  BookOpen,
  Target,
  GitBranch,
  Library,
  CalendarDays,
  PencilLine,
  Trophy,
  Sparkles,
  Database,
  Smartphone,
  LayoutGrid,
  Calendar,
  Swords,
  Globe,
  ChevronDown,
  MessageSquareQuote,
  Maximize2,
  Minimize2,
  Flame,
  Wind,
  Warehouse
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
import { AVAILABLE_LOCALES } from "@/lib/i18n-config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useClubAccessMatrix } from "@/contexts/club-access-matrix-context";
import {
  canAccessClubModule,
  shouldBypassClubMatrix,
  type ClubModuleId,
} from "@/lib/club-permissions";

interface NavItem {
  title: string;
  href: string;
  icon: any;
  category: "global" | "operational" | "methodology" | "user";
  roles?: string[];
  isSubItem?: boolean;
  /** Módulo de matriz de club (filtro A/V/E/X vía `access`). */
  moduleId?: ClubModuleId;
}

/** `usePathname()` no incluye query; alinear con enlaces tipo `/ruta?foo=bar`. */
function pathnameFromNavHref(href: string): string {
  const q = href.indexOf("?");
  return q === -1 ? href : href.slice(0, q);
}

const navItems: NavItem[] = [
  // CONTROL_GLOBAL (Admin Global) - EMERALD THEME
  { title: "Dashboard", href: "/admin-global", icon: LayoutDashboard, category: "global" },
  { title: "Gestión Clubes", href: "/admin-global/clubs", icon: Building2, category: "global" },
  { title: "Leads & Feedback", href: "/admin-global/collaboration", icon: MessageSquareQuote, category: "global" },
  { title: "Gestión Planes", href: "/admin-global/plans", icon: TicketPercent, category: "global" },
  { title: "Gestión Roles", href: "/admin-global/roles", icon: Fingerprint, category: "global" },
  { title: "Promos AI", href: "/admin-global/promos", icon: Zap, category: "global" },
  { title: "Gen. Usuarios", href: "/admin-global/users", icon: UserPlus, category: "global" },
  { title: "Analytics Global", href: "/admin-global/analytics", icon: BarChart3, category: "global" },
  { title: "Almacén Neural", href: "/admin-global/exercises", icon: Database, category: "global" },
  { title: "Cuadro Matriz Club", href: "/admin-global/club-access-matrix", icon: LayoutGrid, category: "global" },
  
  // ESTRATEGIA_METODOLÓGICA - AMBER THEME
  { title: "Objetivos", href: "/dashboard/methodology/objectives", icon: Target, category: "methodology", roles: ["superadmin", "club_admin", "academy_director", "methodology_director"], moduleId: "planner" },
  { title: "Planificador Ciclos", href: "/dashboard/methodology/cycle-planner", icon: GitBranch, category: "methodology", roles: ["superadmin", "club_admin", "academy_director", "methodology_director"], moduleId: "planner" },
  { title: "Agenda Ocupación", href: "/dashboard/methodology/calendar", icon: Calendar, category: "methodology", roles: ["superadmin", "club_admin", "academy_director", "methodology_director", "coach", "promo_coach"], moduleId: "planner" },
  { title: "Pizarra Partido", href: "/board/match?source=elite", icon: Trophy, category: "methodology", roles: ["superadmin", "club_admin", "academy_director", "methodology_director", "coach", "promo_coach"], moduleId: "board" },
  { title: "Pizarra Ejercicios", href: "/board/training", icon: Sparkles, category: "methodology", roles: ["superadmin", "club_admin", "academy_director", "methodology_director", "coach", "promo_coach"], moduleId: "board" },
  { title: "Biblioteca", href: "/dashboard/methodology/exercise-library", icon: Library, category: "methodology", roles: ["superadmin", "club_admin", "academy_director", "methodology_director", "coach", "promo_coach"], moduleId: "exercises" },
  { title: "Planif. Sesiones", href: "/dashboard/methodology/session-planner", icon: CalendarDays, category: "methodology", roles: ["superadmin", "club_admin", "academy_director", "methodology_director"], moduleId: "planner" },
  { title: "Almacén (Club)", href: "/dashboard/methodology/warehouse", icon: Warehouse, category: "methodology", roles: ["superadmin", "club_admin", "coach", "academy_director", "methodology_director"], moduleId: "planner" },

  // OPERATIVA_ELITE - CYAN THEME
  { title: "Dashboard Club", href: "/dashboard", icon: Cpu, category: "operational" },
  { title: "Admin & Permisos", href: "/dashboard/admin", icon: Settings2, category: "operational", roles: ["superadmin", "club_admin", "academy_director"] },
  { title: "Cuadro Matriz", href: "/dashboard/access-matrix", icon: LayoutGrid, category: "operational", roles: ["superadmin", "club_admin", "academy_director"] },
  { title: "Club", href: "/dashboard/club", icon: Building, category: "operational", moduleId: "club" },
  { title: "Instalaciones", href: "/dashboard/instalaciones", icon: MapPin, category: "operational", moduleId: "facilities" },
  { title: "Staff", href: "/dashboard/staff", icon: UserCog, category: "operational", moduleId: "staff" },
  { title: "Cantera", href: "/dashboard/academy", icon: Sprout, category: "operational", moduleId: "academy" },
  { title: "Jugadores", href: "/dashboard/players", icon: Users, category: "operational", moduleId: "players" },
  { title: "Tactical Board", href: "/board/match?source=elite", icon: Monitor, category: "operational", moduleId: "board" },
  { title: "Config. Watch", href: "/dashboard/watch-config", icon: Smartphone, category: "operational", moduleId: "peripherals" },
  { title: "Modo Continuidad", href: "/dashboard/mobile-continuity", icon: Smartphone, category: "operational", moduleId: "peripherals" },
  { title: "Planif. y Sesiones", href: "/dashboard/sessions", icon: CalendarDays, category: "operational", moduleId: "planner" },
  { title: "Biblioteca Táctica", href: "/dashboard/coach/library", icon: Dumbbell, category: "operational", moduleId: "exercises" },
  { title: "Neural Planner", href: "/dashboard/coach/planner", icon: Activity, category: "operational", moduleId: "planner" },
  
  // TERMINALES_ACCESO - NODO SANDBOX (Categoría User)
  { title: "Mi Equipo Local", href: "/dashboard/promo/team", icon: Users, category: "user" },
  { title: "Mis Tareas", href: "/dashboard/promo/tasks", icon: Dumbbell, category: "user" },
  { title: "Agenda Promo", href: "/dashboard/promo/sessions", icon: Calendar, category: "user" },
  { title: "Mis Partidos", href: "/dashboard/promo/matches", icon: Swords, category: "user" },
  { title: "Estadísticas", href: "/dashboard/promo/stats", icon: BarChart3, category: "user" },
  { title: "Pizarra Promo", href: "/board/promo", icon: Zap, category: "user" },
  { title: "Colaboración", href: "/dashboard/promo/collaboration", icon: MessageSquareQuote, category: "user" },
  { title: "Config Watch", href: "/dashboard/promo/watch-config", icon: Watch, category: "user" },
  
  // OTROS TERMINALES
  { title: "Tutor Portal", href: "/tutor", icon: UserCircle, category: "user", roles: ["superadmin"] },
  { title: "Smartwatch Link", href: "/smartwatch", icon: Watch, category: "user", roles: ["superadmin"] },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toggleSidebar, state, setOpenMobile, isMobile } = useSidebar();
  const { profile, logout } = useAuth();
  const { normalizedMatrix, loading: matrixLoading } = useClubAccessMatrix();
  const [currentLang, setCurrentLang] = useState(AVAILABLE_LOCALES[0]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const syncFullscreen = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", syncFullscreen);
    return () => document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }, []);
  
  if (pathname === "/dashboard/coach/onboarding") return null;

  const isSuperAdmin = profile?.role === "superadmin";
  const isFree = profile?.plan === "free" || profile?.role === "promo_coach";
  const isCollapsed = state === "collapsed";

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const filteredItems = navItems.filter(item => {
    if (isSuperAdmin) return true;
    if (item.roles && profile) {
      if (!item.roles.includes(profile.role)) return false;
    }
    if (isFree) {
      // Los usuarios gratuitos ven Terminales de Acceso y el Hub inicial
      if (item.category === "user") return true;
      if (item.category === "operational" && item.href === "/dashboard") return true;
      return false;
    }
    if (
      item.moduleId &&
      profile?.role &&
      !shouldBypassClubMatrix(profile.role) &&
      !matrixLoading
    ) {
      if (!canAccessClubModule(normalizedMatrix, profile.role, item.moduleId, "access")) {
        return false;
      }
    }
    // Fail-closed: si aún no cargó matriz para usuarios no bypass/no free, ocultamos módulos sensibles.
    if (
      item.moduleId &&
      profile?.role &&
      !isFree &&
      !shouldBypassClubMatrix(profile.role) &&
      matrixLoading
    ) {
      return false;
    }
    return true;
  });

  return (
    <Sidebar 
      collapsible="icon" 
      className={cn(
        "transition-all duration-700",
        isCollapsed 
          ? "bg-transparent border-r border-primary/30" 
          : "bg-[#04070c] border-r border-white/5 shadow-[4px_0_24px_rgba(0,0,0,0.5)]"
      )}
    >
      <SidebarHeader className={cn(
        "p-8 border-b transition-all duration-700",
        isCollapsed 
          ? "bg-transparent border-primary/20 p-2" 
          : "bg-black/60 backdrop-blur-md border-white/5"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              "p-2.5 rounded-xl shrink-0 transition-all duration-700",
              isSuperAdmin ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "bg-primary shadow-[0_0_15px_rgba(0,242,255,0.3)]",
              isCollapsed && "p-1.5"
            )}>
              <Zap className={cn("text-black animate-pulse", isCollapsed ? "h-4 w-4" : "h-6 w-6")} />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col overflow-hidden animate-in fade-in duration-700">
                <span className="font-headline font-black text-2xl tracking-tighter text-white uppercase italic">
                  Synq<span className="text-primary">AI</span>
                </span>
                <span className="text-[9px] font-black text-white/30 tracking-[0.4em] uppercase">SPORTS_PRO</span>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button 
              onClick={toggleSidebar}
              className="h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-primary transition-all border border-white/5 lg:hidden"
              title="Ocultar Terminal"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className={cn(
        "px-3 py-8 space-y-10 custom-scrollbar overflow-x-hidden transition-all duration-700",
        isCollapsed && "py-4 space-y-6"
      )}>
        {isSuperAdmin && (
          <SidebarGroupWrapper title="Administración" color="text-emerald-400" isCollapsed={isCollapsed}>
            <SidebarMenu>
              {filteredItems.filter(i => i.category === "global").map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarLink item={item} isActive={pathname === pathnameFromNavHref(item.href)} isGlobal onNavClick={handleNavClick} />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupWrapper>
        )}

        {!isFree && (
          <SidebarGroupWrapper title="Metodología" color="text-amber-500" isCollapsed={isCollapsed}>
            <SidebarMenu>
              {filteredItems.filter(i => i.category === "methodology").map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarLink item={item} isActive={pathname === pathnameFromNavHref(item.href)} isMethodology onNavClick={handleNavClick} />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupWrapper>
        )}

        {!isFree && (
          <SidebarGroupWrapper title="Dashboard Club" color="text-primary" isCollapsed={isCollapsed}>
            <SidebarMenu>
              {filteredItems.filter(i => i.category === "operational").map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarLink item={item} isActive={pathname === pathnameFromNavHref(item.href)} onNavClick={handleNavClick} />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupWrapper>
        )}

        <SidebarGroupWrapper title="Terminales_Acceso" color="text-white/60" isCollapsed={isCollapsed}>
          {!isCollapsed && (
            <div className="px-4 py-2 mb-2 bg-blue-500/5 border border-blue-500/10 rounded-xl">
               <span className="text-[7px] font-black text-blue-400 uppercase tracking-[0.3em] italic flex items-center gap-2">
                 <LayoutGrid className="h-2.5 w-2.5" /> NODO_SANDBOX_ACTIVE
               </span>
            </div>
          )}
          <SidebarMenu>
            {filteredItems.filter(i => i.category === "user").map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarLink item={item} isActive={pathname === pathnameFromNavHref(item.href)} isSandbox={item.href.includes('promo')} onNavClick={handleNavClick} />
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupWrapper>
      </SidebarContent>

      <SidebarFooter className={cn(
        "border-t transition-all duration-700",
        isCollapsed ? "p-2" : "p-4 space-y-2 bg-[#04070c] border-r border-white/5 shadow-[4px_0_24px_rgba(0,0,0,0.5)]"
      )}>
        {!isCollapsed && (
          <button 
            onClick={toggleFullscreen}
            className="flex items-center gap-3 px-3 py-2.5 text-white/30 hover:text-primary transition-all font-black text-[9px] uppercase tracking-widest hover:bg-white/5 rounded-xl group overflow-hidden w-full text-left"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4 shrink-0" /> : <Maximize2 className="h-4 w-4 shrink-0" />}
            <span className="whitespace-nowrap font-bold animate-in fade-in duration-700">MODO_INMERSIVO</span>
          </button>
        )}

        {!isCollapsed && (
          <div className="px-2 py-1 border-b border-white/5 pb-2 mb-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center justify-between w-full p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all group">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{currentLang.flag}</span>
                    <span className="text-[9px] font-black text-white/60 uppercase tracking-widest group-hover:text-white transition-colors">{currentLang.label}</span>
                  </div>
                  <ChevronDown className="h-3 w-3 text-white/20 group-hover:text-primary" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-[#0a0f18] border-primary/20 text-white rounded-2xl shadow-2xl p-2 mb-2">
                {AVAILABLE_LOCALES.map((lang) => (
                  <DropdownMenuItem 
                    key={lang.code} 
                    onClick={() => setCurrentLang(lang)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-primary/10 hover:text-primary cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span>{lang.flag}</span>
                      <span className="text-[9px] font-black uppercase tracking-widest">{lang.label}</span>
                    </div>
                    {currentLang.code === lang.code && <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 text-white/30 hover:text-primary transition-all font-black text-[9px] uppercase tracking-widest hover:bg-white/5 rounded-xl group overflow-hidden w-full text-left"
        >
          <LogOut className="h-5 w-5 shrink-0 group-hover:translate-x-1 transition-transform" />
          {!isCollapsed && <span className="whitespace-nowrap font-bold animate-in fade-in duration-700">CERRAR_SESIÓN</span>}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}

function SidebarGroupWrapper({ children, title, color, isCollapsed }: any) {
  return (
    <SidebarGroup className="p-0">
      {!isCollapsed && (
        <p className={cn("px-4 mb-4 text-[8px] font-black uppercase tracking-[0.5em] transition-all duration-700 animate-pulse", color)}>
          {title}
        </p>
      )}
      {children}
    </SidebarGroup>
  );
}

function SidebarLink({ 
  item, 
  isActive, 
  isGlobal, 
  isMethodology, 
  isSandbox,
  onNavClick
}: { 
  item: NavItem; 
  isActive: boolean; 
  isGlobal?: boolean; 
  isMethodology?: boolean; 
  isSandbox?: boolean;
  onNavClick: () => void;
}) {
  const activeClass = isGlobal 
    ? "bg-emerald-500/10 text-emerald-400 shadow-[0_4px_15px_rgba(16,185,129,0.15)] emerald-text-glow"
    : isMethodology
    ? "bg-amber-500/10 text-amber-500 shadow-[0_4px_15px_rgba(245,158,11,0.15)] amber-text-glow"
    : isSandbox
    ? "bg-blue-500/10 text-blue-400 shadow-[0_4px_15px_rgba(59,130,246,0.15)] blue-text-glow"
    : "bg-primary/10 text-primary shadow-[0_4px_15px_rgba(0,242,255,0.15)] cyan-text-glow";

  const iconClass = isGlobal 
    ? (isActive ? "text-emerald-400 scale-110" : "group-hover:text-emerald-400 group-hover:scale-110")
    : isMethodology
    ? (isActive ? "text-amber-500 scale-110" : "group-hover:text-amber-500 group-hover:scale-110")
    : isSandbox
    ? (isActive ? "text-blue-400 scale-110" : "group-hover:text-blue-400 group-hover:scale-110")
    : (isActive ? "text-primary scale-110" : "group-hover:text-primary group-hover:scale-110");

  return (
    <SidebarMenuButton
      asChild
      isActive={isActive}
      className={cn(
        "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
        isActive ? activeClass : "text-white/40 hover:text-white hover:bg-white/[0.04]"
      )}
    >
      <Link 
        href={item.href}
        onClick={onNavClick}
      >
        <item.icon className={cn("h-5 w-5 shrink-0 transition-all duration-700", iconClass)} />
        <span className="font-bold text-[10px] uppercase tracking-[0.25em] whitespace-nowrap animate-in fade-in duration-700">
          {item.title}
        </span>
        {isActive && (
          <div className={cn(
            "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/5 rounded-full",
            isGlobal ? "bg-emerald-500" : isMethodology ? "bg-amber-500" : isSandbox ? "bg-blue-500" : "bg-primary"
          )} />
        )}
      </Link>
    </SidebarMenuButton>
  );
}
