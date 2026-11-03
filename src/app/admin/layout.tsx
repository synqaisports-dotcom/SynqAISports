import Link from 'next/link';
import { redirect } from 'next/navigation';
import { isDemoActive } from '@/lib/demo';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isDemoActive())) redirect('/demo?next=/admin');

  return (
    <div className="min-h-screen synq-mesh-bg text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-synq-accent">SynqAI</p>
            <p className="text-lg font-semibold">Admin</p>
          </div>
          <nav className="flex items-center gap-4 text-sm text-synq-muted">
            <Link href="/admin/free" className="hover:text-white">
              Coach Free
            </Link>
            <Link href="/admin" className="hover:text-white">
              Founding
            </Link>
            <Link href="/portal" className="hover:text-white">
              Portal del club
            </Link>
            <Link href="/" className="hover:text-white">
              Web pública
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}
