'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
  ClipboardList,
  LayoutDashboard,
  Settings,
  Users,
} from 'lucide-react';

const links = [
  { href: '/portal', label: 'Inicio', icon: LayoutDashboard, exact: true },
  { href: '/portal/club', label: 'Club', icon: Building2 },
  { href: '/portal/cantera', label: 'Cantera', icon: Users },
  { href: '/portal/metodologia', label: 'Metodología', icon: ClipboardList },
  { href: '/portal/config', label: 'Configuración', icon: Settings },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PortalNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-1 p-3">
      {links.map(({ href, label, icon: Icon, exact }) => {
        const active = isActive(pathname, href, exact);
        return (
          <Link
            key={href}
            href={href}
            className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
              active
                ? 'bg-gradient-to-r from-synq-pitch/20 to-synq-accent/10 text-white shadow-[inset_0_0_0_1px_rgba(34,197,94,0.25)]'
                : 'text-synq-muted hover:bg-white/[0.06] hover:text-white'
            }`}
          >
            <Icon
              className={`h-4 w-4 shrink-0 ${active ? 'text-synq-accent' : 'text-synq-muted group-hover:text-synq-accent'}`}
            />
            {label}
          </Link>
        );
      })}
      <div className="mt-6 rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-3 py-3 text-xs leading-relaxed text-synq-muted">
        <p className="font-medium text-white/80">Próximamente</p>
        <p className="mt-1">Patrocinadores, pantallas LED y torneos.</p>
      </div>
    </nav>
  );
}
