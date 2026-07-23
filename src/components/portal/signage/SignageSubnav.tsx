'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Monitor, CalendarClock, ImageIcon, Megaphone } from 'lucide-react';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '/portal/signage', label: 'Resumen', exact: true },
  { href: '/portal/signage/patrocinadores', label: 'Patrocinadores', icon: Megaphone },
  { href: '/portal/signage/contenido', label: 'Contenido', icon: ImageIcon },
  { href: '/portal/signage/pantallas', label: 'Pantallas', icon: Monitor },
  { href: '/portal/signage/programacion', label: 'Programación', icon: CalendarClock },
];

export function SignageSubnav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2">
      {LINKS.map((link) => {
        const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm transition-all',
              active
                ? 'border-cyan-400/50 bg-cyan-400/10 text-cyan-100'
                : 'border-primary/15 text-muted-foreground hover:border-cyan-400/30 hover:text-foreground'
            )}
          >
            {Icon ? <Icon className="size-3.5" /> : null}
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
