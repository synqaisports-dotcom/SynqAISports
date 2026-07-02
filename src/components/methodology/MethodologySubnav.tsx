'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/portal/metodologia', label: 'Resumen', exact: true },
  { href: '/portal/metodologia/ciclos', label: 'Ciclos', exact: false },
  { href: '/portal/metodologia/ejercicios', label: 'Ejercicios', exact: false },
  { href: '/portal/metodologia/objetivos', label: 'Objetivos', exact: false },
  { href: '/portal/metodologia/solicitudes', label: 'Solicitudes', exact: false },
];

export function MethodologySubnav() {
  const pathname = usePathname();

  return (
    <nav className="mb-8 flex flex-wrap gap-2 border-b border-white/5 pb-4">
      {links.map(({ href, label, exact }) => {
        const isActive = exact
          ? pathname === href
          : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              isActive
                ? 'bg-synq-pitch/20 text-synq-accent'
                : 'text-synq-muted hover:bg-white/5 hover:text-white'
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
