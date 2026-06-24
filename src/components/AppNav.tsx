'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Dna, LayoutDashboard, Radar } from 'lucide-react';

const NAV = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/radar', label: 'Radar', icon: Radar },
  { href: '/adn', label: 'ADN', icon: Dna },
] as const;

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-1 rounded-lg border border-white/10 bg-black/20 p-1">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
              active
                ? 'bg-tp-cyan/15 text-tp-cyan'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
