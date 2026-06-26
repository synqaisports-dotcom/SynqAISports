import Link from 'next/link';
import { PortalSignOutButton } from '@/components/portal/PortalSignOutButton';

const links = [
  { href: '/portal', label: 'Inicio' },
  { href: '/portal/club', label: 'Club' },
  { href: '/portal/cantera', label: 'Cantera' },
  { href: '/portal/metodologia', label: 'Metodología' },
  { href: '/portal/config', label: 'Configuración' },
];

type Props = {
  clubName: string;
  role: string;
};

export function PortalSidebar({ clubName, role }: Props) {
  const roleLabel = (role || 'admin').replace(/_/g, ' ');

  return (
    <aside
      className="flex w-56 shrink-0 flex-col border-r border-white/10 bg-synq-slate"
      style={{ backgroundColor: '#132337', color: '#e8edf4', borderRight: '1px solid rgba(255,255,255,0.1)' }}
    >
      <div className="border-b border-white/10 p-5">
        <p className="text-[10px] uppercase tracking-widest" style={{ color: '#94a3b8' }}>
          Portal club
        </p>
        <p className="mt-1 font-semibold truncate" style={{ color: '#ffffff' }}>
          {clubName}
        </p>
        <p className="text-xs capitalize" style={{ color: '#94a3b8' }}>
          {roleLabel}
        </p>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="block rounded-lg px-3 py-2 text-sm hover:bg-white/10"
            style={{ color: '#e8edf4' }}
          >
            {label}
          </Link>
        ))}
        <div
          className="mt-4 rounded-lg border border-dashed border-white/10 px-3 py-2 text-xs"
          style={{ color: '#94a3b8' }}
        >
          Patrocinadores, signage y torneos — próximamente
        </div>
      </nav>
      <div className="border-t border-white/10 p-3">
        <PortalSignOutButton />
      </div>
    </aside>
  );
}
