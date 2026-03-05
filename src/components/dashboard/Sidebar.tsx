"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Zap, 
  LayoutDashboard, 
  Building2, 
  Users, 
  BrainCircuit, 
  LogOut, 
  Settings,
  CalendarDays,
  Activity,
  Cpu,
  Dumbbell
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { useAuth, UserRole } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  {
    title: "Terminal Central",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["superadmin", "club_admin", "coach", "tutor"],
  },
  {
    title: "Gestión de Nodos",
    href: "/dashboard/superadmin/clubs",
    icon: Building2,
    roles: ["superadmin"],
  },
  {
    title: "Base de Personal",
    href: "/dashboard/clubadmin/users",
    icon: Users,
    roles: ["club_admin"],
  },
  {
    title: "Neural Planner",
    href: "/dashboard/coach/planner",
    icon: BrainCircuit,
    roles: ["coach", "superadmin"],
  },
  {
    title: "Módulos Tácticos",
    href: "/dashboard/coach/exercises",
    icon: Dumbbell,
    roles: ["coach", "superadmin"],
  },
  {
    title: "Monitoreo de Activos",
    href: "/dashboard/coach/athletes",
    icon: Activity,
    roles: ["coach"],
  },
  {
    title: "Calendario de Misión",
    href: "/dashboard/schedule",
    icon: CalendarDays,
    roles: ["coach", "tutor", "club_admin"],
  },
  {
    title: "Configuración",
    href: "/dashboard/settings",
    icon: Settings,
    roles: ["superadmin", "club_admin", "coach", "tutor"],
  },
];

export function DashboardSidebar() {
  const { profile } = useAuth();
  const pathname = usePathname();

  if (!profile) return null;

  const filteredItems = navItems.filter((item) =>
    item.roles.includes(profile.role)
  );

  return (
    <div className="flex flex-col h-full bg-background border-r border-white/5 w-64 fixed left-0 top-0 z-30">
      <div className="p-8 flex items-center gap-3 border-b border-white/5">
        <div className="bg-primary p-2 rounded-sm rotate-45 cyan-glow">
          <Zap className="h-5 w-5 text-primary-foreground -rotate-45" />
        </div>
        <span className="font-headline font-black text-xl tracking-tighter text-white uppercase cyan-text-glow">
          SYNQ<span className="text-primary">PRO</span>
        </span>
      </div>

      <div className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
        <p className="px-3 mb-6 text-[8px] font-black uppercase tracking-[0.4em] text-white/20">
          Centro_de_Operaciones
        </p>
        <div className="space-y-1">
          {filteredItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
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
                <span className="font-bold text-[10px] uppercase tracking-[0.2em]">{item.title}</span>
                {isActive && (
                  <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-primary cyan-glow animate-pulse" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="p-6 border-t border-white/5 bg-black/20">
        <div className="flex items-center gap-4 px-4 py-4 mb-6 bg-white/5 border border-white/5">
          <div className="bg-primary/20 p-2 border border-primary/40">
            <Cpu className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-[10px] font-black text-white truncate uppercase tracking-widest">
              {profile.role.replace("_", " ")}
            </p>
            <p className="text-[8px] text-white/30 truncate uppercase tracking-tighter">{profile.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut(auth)}
          className="flex items-center gap-4 w-full px-4 py-3 text-white/40 hover:text-destructive hover:bg-destructive/10 transition-all font-bold text-[10px] uppercase tracking-widest"
        >
          <LogOut className="h-4 w-4" />
          TERMINAR_SESIÓN
        </button>
      </div>
    </div>
  );
}
