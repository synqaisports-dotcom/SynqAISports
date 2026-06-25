'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BookOpen,
  LayoutDashboard,
  Settings,
  Shield,
  Users,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const links = [
  { href: '/portal', label: 'Inicio', icon: LayoutDashboard, exact: true },
  { href: '/portal/club', label: 'Club', icon: Shield, exact: false },
  { href: '/portal/cantera', label: 'Cantera', icon: Users, exact: false },
  { href: '/portal/metodologia', label: 'Metodología', icon: BookOpen, exact: false },
  { href: '/portal/config', label: 'Configuración', icon: Settings, exact: false },
];

type Props = {
  clubName: string;
  role: string;
};

export function PortalSidebar({ clubName, role }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-white/5 bg-synq-slate/60">
      <div className="border-b border-white/5 p-5">
        <p className="text-[10px] uppercase tracking-widest text-synq-muted">Portal club</p>
        <p className="mt-1 font-semibold text-white truncate">{clubName}</p>
        <p className="text-xs text-synq-muted capitalize">{role.replace('_', ' ')}</p>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {links.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? 'bg-synq-pitch/20 text-synq-accent'
                  : 'text-synq-muted hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
        <div className="mt-4 rounded-lg border border-dashed border-white/10 px-3 py-2 text-xs text-synq-muted">
          Patrocinadores, signage y torneos — próximamente
        </div>
      </nav>
      <div className="border-t border-white/5 p-3">
        <button
          type="button"
          onClick={signOut}
          className="w-full rounded-lg px-3 py-2 text-left text-sm text-synq-muted hover:bg-white/5 hover:text-white"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
