'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  ClipboardList,
  GitBranch,
  LayoutGrid,
  Target,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const links: { href: string; label: string; exact: boolean; icon: LucideIcon }[] = [
  { href: '/portal/metodologia', label: 'Resumen', exact: true, icon: LayoutGrid },
  { href: '/portal/metodologia/ciclos', label: 'Ciclos', exact: false, icon: GitBranch },
  { href: '/portal/metodologia/ejercicios', label: 'Ejercicios', exact: false, icon: BookOpen },
  { href: '/portal/metodologia/objetivos', label: 'Objetivos', exact: false, icon: Target },
  { href: '/portal/metodologia/solicitudes', label: 'Solicitudes', exact: false, icon: ClipboardList },
];

export function MethodologySubnav() {
  const pathname = usePathname();

  return (
    <nav className="portal-subnav-divider mb-8 flex flex-wrap gap-2 pb-4">
      {links.map(({ href, label, exact, icon: Icon }) => {
        const isActive = exact
          ? pathname === href
          : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm transition-colors',
              isActive
                ? 'bg-synq-pitch/20 text-synq-accent'
                : 'text-synq-muted hover:bg-white/5 hover:text-white'
            )}
          >
            <Icon className="size-4 shrink-0" strokeWidth={isActive ? 2.25 : 2} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
