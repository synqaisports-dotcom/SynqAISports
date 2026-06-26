import { Suspense } from 'react';
import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { getLocale } from '@/lib/i18n/get-locale';
import { isDemoActive } from '@/lib/demo';

type Props = { searchParams: Promise<{ error?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const { error } = await searchParams;
  const demo = await isDemoActive();

  return (
    <div className="flex min-h-screen items-center justify-center bg-synq-navy px-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-synq-slate/40 p-8">
        <p className="text-[10px] uppercase tracking-widest text-synq-muted">Nexus Labs</p>
        <h1 className="mt-2 font-serif-display text-3xl text-white">{dict.login.title}</h1>
        <p className="mt-2 text-sm text-synq-muted">{dict.login.subtitle}</p>

        <div className="mt-6 rounded-xl border border-synq-accent/40 bg-synq-pitch/10 p-4">
            <p className="text-sm font-semibold text-white">Acceso demo (sin contraseña)</p>
            <p className="mt-1 text-xs text-synq-muted">
              Pulsa para ver el portal del club sin configurar login.
            </p>
            <Link
              href="/demo"
              className="mt-4 flex w-full items-center justify-center rounded-full bg-synq-pitch py-3 text-sm font-semibold text-white hover:bg-synq-accent"
            >
              Ver portal del club (demo)
            </Link>
          </div>

        {demo && (
          <p className="mt-4 text-center text-xs text-synq-accent">Modo demo ya activo — también puedes ir a /portal</p>
        )}

        {error === 'no_club' && !demo && (
          <div className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100">
            <p className="font-semibold">Tu usuario no está vinculado a ningún club.</p>
            <p className="mt-2 text-amber-100/90">
              En Supabase → SQL Editor ejecuta el insert de <code className="text-white">synq_staff</code>{' '}
              (te lo pasamos en el chat). Sin eso el portal no puede cargar.
            </p>
          </div>
        )}

        <div className="mt-8">
          <Suspense fallback={<p className="text-sm text-synq-muted">…</p>}>
            <LoginForm dict={dict} />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-xs text-synq-muted">
          ¿Problemas con el login? Usa el botón demo de arriba.
        </p>
      </div>
    </div>
  );
}
