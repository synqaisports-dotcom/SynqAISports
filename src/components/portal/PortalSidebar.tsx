import Link from 'next/link';
import { Shield } from 'lucide-react';
import { PortalNav } from '@/components/portal/PortalNav';
import { PortalSignOutButton } from '@/components/portal/PortalSignOutButton';

type Props = {
  clubName: string;
  role: string;
  demoMode?: boolean;
};

export function PortalSidebar({ clubName, role, demoMode = false }: Props) {
  const roleLabel = (role || 'admin').replace(/_/g, ' ');

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-white/10 bg-synq-slate/80 backdrop-blur-xl">
      <div className="border-b border-white/10 p-5">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-synq-pitch to-synq-accent shadow-lg shadow-synq-pitch/20">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-synq-muted">
              Portal club
            </p>
            <p className="truncate font-semibold text-white">{clubName}</p>
          </div>
        </div>
        <p className="mt-3 inline-flex rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[11px] capitalize text-synq-muted">
          {roleLabel}
        </p>
      </div>

      <PortalNav />

      <div className="border-t border-white/10 p-3">
        {demoMode ? (
          <Link
            href="/"
            className="block w-full rounded-xl px-3 py-2.5 text-left text-sm text-synq-muted transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            ← Volver a la web
          </Link>
        ) : (
          <PortalSignOutButton />
        )}
      </div>
    </aside>
  );
}
