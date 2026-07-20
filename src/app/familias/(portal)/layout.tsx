import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getFamilyContext } from '@/lib/family-auth';
import { isDemoActive } from '@/lib/demo';
import { SynqBrandLockup } from '@/components/brand/SynqBrandLockup';

type Props = {
  children: React.ReactNode;
};

export default async function FamiliasPortalLayout({ children }: Props) {
  const family = await getFamilyContext();
  const demo = await isDemoActive();

  if (!family && !demo) {
    redirect('/familias/login');
  }

  const ctx = family;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-primary/15 bg-card/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
          <Link href="/familias" className="flex min-w-0 items-center gap-3">
            <SynqBrandLockup layout="horizontal" iconSize={28} wordmarkSize="sm" />
            {ctx ? (
              <span className="truncate text-sm text-muted-foreground">{ctx.club.name}</span>
            ) : null}
          </Link>
          {ctx ? (
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/familias" className="text-muted-foreground hover:text-primary">
                Inicio
              </Link>
              <Link href="/familias/reservas" className="text-muted-foreground hover:text-primary">
                Reservas
              </Link>
              <span className="hidden text-xs text-muted-foreground sm:inline">
                {ctx.account.display_name ?? ctx.account.email}
              </span>
            </nav>
          ) : null}
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
