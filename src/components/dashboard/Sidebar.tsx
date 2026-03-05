
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
  UserCircle
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
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["superadmin", "club_admin", "coach", "tutor"],
  },
  {
    title: "Manage Clubs",
    href: "/dashboard/superadmin/clubs",
    icon: Building2,
    roles: ["superadmin"],
  },
  {
    title: "Staff Roster",
    href: "/dashboard/clubadmin/users",
    icon: Users,
    roles: ["club_admin"],
  },
  {
    title: "AI Training Planner",
    href: "/dashboard/coach/planner",
    icon: BrainCircuit,
    roles: ["coach", "superadmin"],
  },
  {
    title: "My Athletes",
    href: "/dashboard/coach/athletes",
    icon: Users,
    roles: ["coach"],
  },
  {
    title: "Weekly Schedule",
    href: "/dashboard/schedule",
    icon: CalendarDays,
    roles: ["coach", "tutor", "club_admin"],
  },
  {
    title: "Settings",
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
    <div className="flex flex-col h-full bg-white border-r w-64 fixed left-0 top-0 z-30 shadow-sm">
      <div className="p-6 flex items-center gap-2 border-b">
        <div className="bg-primary p-1.5 rounded-lg">
          <Zap className="h-5 w-5 text-white" />
        </div>
        <span className="font-headline font-bold text-lg tracking-tight text-primary">SynqSports</span>
      </div>

      <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <p className="px-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Main Menu
        </p>
        {filteredItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group",
                isActive 
                  ? "bg-primary text-white shadow-md shadow-primary/20" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-primary"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5",
                isActive ? "text-white" : "text-slate-400 group-hover:text-primary"
              )} />
              <span className="font-medium text-sm">{item.title}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t bg-slate-50/50">
        <div className="flex items-center gap-3 px-3 py-3 mb-4 rounded-2xl bg-white border shadow-sm">
          <div className="bg-accent/20 p-2 rounded-full">
            <UserCircle className="h-6 w-6 text-accent" />
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate uppercase tracking-tighter">
              {profile.role.replace("_", " ")}
            </p>
            <p className="text-[10px] text-slate-500 truncate">{profile.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut(auth)}
          className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-600 hover:text-destructive hover:bg-destructive/5 rounded-xl transition-colors font-medium text-sm"
        >
          <LogOut className="h-5 w-5" />
          Log Out
        </button>
      </div>
    </div>
  );
}
