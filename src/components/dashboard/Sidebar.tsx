
"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
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
import { useI18n } from "@/contexts/i18n-context";
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
  category: "global" | "operational" | "methodology" | "tournaments" | "user";
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
  { title: "Gestión Planes", href: "/admin-global/plans", icon: TicketPercent, category: "global" },
  { title: "Gestión Roles", href: "/admin-global/roles", icon: Fingerprint, category: "global" },
  { title: "Gen. Usuarios", href: "/admin-global/users", icon: UserPlus, category: "global" },
  { title: "System Health", href: "/admin-global/health", icon: Activity, category: "global" },
  { title: "Analytics Global", href: "/admin-global/analytics", icon: BarChart3, category: "global" },
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

  // TORNEOS (fuera de competición normal)
  { title: "Torneos", href: "/dashboard/tournaments/list", icon: BookOpen, category: "tournaments", roles: ["superadmin", "club_admin", "academy_director", "methodology_director", "coach"] },
  { title: "Inscripciones", href: "/dashboard/tournaments/registration", icon: UserPlus, category: "tournaments", roles: ["superadmin", "club_admin", "academy_director", "methodology_director", "coach"] },
  { title: "Mesa Control", href: "/dashboard/tournaments/control", icon: ShieldCheck, category: "tournaments", roles: ["superadmin", "club_admin", "academy_director", "methodology_director", "coach"] },
  
  // TERMINALES_ACCESO - NODO SANDBOX (Categoría User)
  { title: "Sandbox", href: "/sandbox-portal?dest=/sandbox/app", icon: ShieldCheck, category: "user" },
  { title: "Live Fields TV", href: "/live-fields", icon: Monitor, category: "user" },
  { title: "Config Watch", href: "/dashboard/watch-config", icon: Watch, category: "user" },
  { title: "Modo Continuidad", href: "/dashboard/mobile-continuity", icon: Smartphone, category: "user" },
  { title: "Smartwatch Link", href: "/smartwatch", icon: Watch, category: "user" },
  
  // OTROS TERMINALES
  { title: "Tutor Portal", href: "/tutor", icon: UserCircle, category: "user", roles: ["superadmin"] },
  // Smartwatch Link está arriba para que se vea también en modo free
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toggleSidebar, state, setOpenMobile, isMobile } = useSidebar();
  const { profile, logout } = useAuth();
  const { normalizedMatrix, loading: matrixLoading } = useClubAccessMatrix();
  const { locale, setLocale, t } = useI18n();
  const currentLang = AVAILABLE_LOCALES.find((l) => l.code === locale) ?? AVAILABLE_LOCALES[0];
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<NavItem["category"], boolean>>({
    global: true,
    methodology: true,
    operational: true,
    tournaments: true,
    user: true,
  });

  useEffect(() => {
    const syncFullscreen = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", syncFullscreen);
    return () => document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("synq_sidebar_group_open_v1");
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<Record<NavItem["category"], boolean>>;
      setOpenGroups((prev) => ({ ...prev, ...parsed }));
    } catch {
      // ignore localStorage errors
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("synq_sidebar_group_open_v1", JSON.stringify(openGroups));
    } catch {
      // ignore localStorage errors
    }
  }, [openGroups]);

  useEffect(() => {
    const activeCategory = navItems.find((i) => pathname === pathnameFromNavHref(i.href))?.category;
    if (!activeCategory) return;
    setOpenGroups((prev) => (prev[activeCategory] ? prev : { ...prev, [activeCategory]: true }));
  }, [pathname]);

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

  const filteredItems = useMemo(() => navItems.filter(item => {
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
  }), [isSuperAdmin, profile, isFree, matrixLoading, normalizedMatrix]);

  const groupedItems = useMemo(
    () => ({
      global: filteredItems.filter((i) => i.category === "global"),
      methodology: filteredItems.filter((i) => i.category === "methodology"),
      operational: filteredItems.filter((i) => i.category === "operational"),
      tournaments: filteredItems.filter((i) => i.category === "tournaments"),
      user: filteredItems.filter((i) => i.category === "user"),
    }),
    [filteredItems],
  );

  const toggleGroup = (category: NavItem["category"]) => {
    setOpenGroups((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const GroupToggle = ({
    category,
    label,
    toneClass,
  }: {
    category: NavItem["category"];
    label: string;
    toneClass: string;
  }) =>
    !isCollapsed ? (
      <button
        type="button"
        onClick={() => toggleGroup(category)}
        className={cn(
          "w-full mb-2 px-4 py-2 rounded-xl border bg-white/5 hover:bg-white/10 transition-[background-color,border-color,color,opacity,transform] flex items-center justify-between",
          toneClass,
        )}
        aria-expanded={openGroups[category]}
      >
        <span className="text-[9px] font-black uppercase tracking-[0.25em]">
          {label}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform",
            openGroups[category] ? "rotate-180" : "rotate-0",
          )}
        />
      </button>
    ) : null;

  return (
    <Sidebar 
      collapsible="icon" 
      className={cn(
        "transition-[background-color,border-color,color,opacity,transform] duration-700",
        isCollapsed 
          ? "bg-transparent border-r border-primary/30" 
          : "bg-[#04070c] border-r border-white/5 shadow-[4px_0_24px_rgba(0,0,0,0.5)]"
      )}
    >
      <SidebarHeader className={cn(
        "p-8 border-b transition-[background-color,border-color,color,opacity,transform] duration-700",
        isCollapsed 
          ? "bg-transparent border-primary/20 p-2" 
          : "bg-black/60 backdrop-blur-md border-white/5"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              "p-2.5 rounded-xl shrink-0 transition-[background-color,border-color,color,opacity,transform] duration-700",
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
              className="h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-primary transition-[background-color,border-color,color,opacity,transform] border border-white/5 lg:hidden"
              title={t("sidebar.hide_terminal")}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className={cn(
        "px-3 py-6 space-y-5 custom-scrollbar overflow-x-hidden transition-[background-color,border-color,color,opacity,transform] duration-700",
        isCollapsed && "py-4 space-y-3"
      )}>
        {isSuperAdmin && (
            <SidebarGroupWrapper title={t("sidebar.group_admin", "Administrador")} color="text-emerald-400" isCollapsed={isCollapsed}>
            <GroupToggle category="global" label="Admin-global" toneClass="border-emerald-500/20 text-emerald-300/90" />
            {openGroups.global && (
            <SidebarMenu>
              {groupedItems.global.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarLink item={item} isActive={pathname === pathnameFromNavHref(item.href)} isGlobal onNavClick={handleNavClick} />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
            )}
          </SidebarGroupWrapper>
        )}

        {!isFree && (
          <SidebarGroupWrapper title={t("sidebar.group_methodology", "Metodología")} color="text-primary" isCollapsed={isCollapsed}>
            <GroupToggle category="methodology" label="Metodología" toneClass="border-cyan-500/20 text-cyan-200/90" />
            {openGroups.methodology && (
            <SidebarMenu>
              {groupedItems.methodology.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarLink item={item} isActive={pathname === pathnameFromNavHref(item.href)} isMethodology onNavClick={handleNavClick} />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
            )}
          </SidebarGroupWrapper>
        )}

        {!isFree && (
          <SidebarGroupWrapper title={t("sidebar.group_dashboard", "Club")} color="text-primary" isCollapsed={isCollapsed}>
            <GroupToggle category="operational" label="Dashboard Club" toneClass="border-primary/20 text-primary/90" />
            {openGroups.operational && (
            <SidebarMenu>
              {groupedItems.operational.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarLink item={item} isActive={pathname === pathnameFromNavHref(item.href)} onNavClick={handleNavClick} />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
            )}
          </SidebarGroupWrapper>
        )}

        {!isFree && (
          <SidebarGroupWrapper title="Torneos" color="text-blue-300/90" isCollapsed={isCollapsed}>
            <GroupToggle category="tournaments" label="Torneos" toneClass="border-blue-500/20 text-blue-200/90" />
            {openGroups.tournaments && (
            <SidebarMenu>
              {groupedItems.tournaments.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarLink
                    item={item}
                    isActive={pathname === pathnameFromNavHref(item.href)}
                    isSandbox
                    onNavClick={handleNavClick}
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
            )}
          </SidebarGroupWrapper>
        )}

        {(isFree || isSuperAdmin) && (
          <SidebarGroupWrapper title={t("sidebar.group_terminals", "Terminales")} color="text-white/60" isCollapsed={isCollapsed}>
            <GroupToggle category="user" label="Terminales" toneClass="border-blue-500/20 text-blue-300/90" />
            {openGroups.user && !isCollapsed && (
              <div className="px-4 py-2 mb-2 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                <span className="text-[7px] font-black text-blue-400 uppercase tracking-[0.3em] italic flex items-center gap-2">
                  <LayoutGrid className="h-2.5 w-2.5" /> NODO_SANDBOX_ACTIVE
                </span>
              </div>
            )}
            {openGroups.user && (
            <SidebarMenu>
              {groupedItems.user.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarLink
                    item={item}
                    isActive={pathname === pathnameFromNavHref(item.href)}
                    isSandbox={item.href.startsWith("/sandbox") || item.href.includes("/promo")}
                    onNavClick={handleNavClick}
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
            )}
          </SidebarGroupWrapper>
        )}
      </SidebarContent>

      <SidebarFooter className={cn(
        "border-t transition-[background-color,border-color,color,opacity,transform] duration-700",
        isCollapsed ? "p-2" : "p-4 space-y-2 bg-[#04070c] border-r border-white/5 shadow-[4px_0_24px_rgba(0,0,0,0.5)]"
      )}>
        {!isCollapsed && (
          <button 
            onClick={toggleFullscreen}
            className="flex items-center gap-3 px-3 py-2.5 text-white/30 hover:text-primary transition-[background-color,border-color,color,opacity,transform] font-black text-[9px] uppercase tracking-widest hover:bg-white/5 rounded-xl group overflow-hidden w-full text-left"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4 shrink-0" /> : <Maximize2 className="h-4 w-4 shrink-0" />}
            <span className="whitespace-nowrap font-bold animate-in fade-in duration-700">MODO_INMERSIVO</span>
          </button>
        )}

        {!isCollapsed && (
          <div className="px-2 py-1 border-b border-white/5 pb-2 mb-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center justify-between w-full p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-[background-color,border-color,color,opacity,transform] group">
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
                    onClick={() => setLocale(lang.code)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-primary/10 hover:text-primary cursor-pointer transition-[background-color,border-color,color,opacity,transform]"
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
          className="flex items-center gap-3 px-3 py-2.5 text-white/30 hover:text-primary transition-[background-color,border-color,color,opacity,transform] font-black text-[9px] uppercase tracking-widest hover:bg-white/5 rounded-xl group overflow-hidden w-full text-left"
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
        <p className={cn("px-4 mb-3 text-[9px] font-black uppercase tracking-[0.45em] transition-[background-color,border-color,color,opacity,transform] duration-700 animate-[pulse_2.8s_ease-in-out_infinite]", color)}>
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
    ? "bg-cyan-400/10 text-cyan-300 shadow-[0_4px_15px_rgba(34,211,238,0.18)] cyan-text-glow"
    : isSandbox
    ? "bg-blue-500/10 text-blue-400 shadow-[0_4px_15px_rgba(59,130,246,0.15)] blue-text-glow"
    : "bg-primary/10 text-primary shadow-[0_4px_15px_rgba(0,242,255,0.15)] cyan-text-glow";

  const iconClass = isGlobal 
    ? (isActive ? "text-emerald-400 scale-110" : "group-hover:text-emerald-400 group-hover:scale-110")
    : isMethodology
    ? (isActive ? "text-cyan-300 scale-110" : "group-hover:text-cyan-300 group-hover:scale-110")
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
        <item.icon className={cn("h-5 w-5 shrink-0 transition-[background-color,border-color,color,opacity,transform] duration-700", iconClass)} />
        <span className="font-bold text-[10px] uppercase tracking-[0.25em] whitespace-nowrap animate-in fade-in duration-700">
          {item.title}
        </span>
        {isActive && (
          <div className={cn(
            "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/5 rounded-full",
            isGlobal ? "bg-emerald-500" : isMethodology ? "bg-cyan-300" : isSandbox ? "bg-blue-500" : "bg-primary"
          )} />
        )}
      </Link>
    </SidebarMenuButton>
  );
}
