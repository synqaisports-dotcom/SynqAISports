import { Suspense } from 'react';
import Link from 'next/link';
import { SynqBrandLockup } from '@/components/brand/SynqBrandLockup';
import { LoginForm } from '@/components/auth/LoginForm';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { getLocale } from '@/lib/i18n/get-locale';
import { DEMO_ENTRY_PATH, isDemoModeEnv } from '@/lib/demo-constants';

type Props = { searchParams: Promise<{ error?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const { error } = await searchParams;
  const vercelDemo = isDemoModeEnv();

  return (
    <div className="flex min-h-screen items-center justify-center bg-synq-navy px-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-synq-slate/40 p-8">
        <SynqBrandLockup layout="stacked" iconSize={56} showTagline showSportsSuffix className="mb-8" />
        <h1 className="font-serif-display text-2xl text-white">
          {vercelDemo ? 'Portal de pruebas' : dict.login.title}
        </h1>
        <p className="mt-2 text-sm text-synq-muted">
          {vercelDemo
            ? 'Entra al club sin contraseña. Vercel es tu entorno de prueba.'
            : dict.login.subtitle}
        </p>

        <div className="mt-6 space-y-3">
          <Link
            href={DEMO_ENTRY_PATH}
            className="flex w-full items-center justify-center rounded-full bg-gradient-to-r from-synq-pitch to-synq-accent py-3 text-sm font-semibold text-white shadow-lg shadow-synq-pitch/20 hover:brightness-110"
          >
            Entrar al portal del club
          </Link>
        </div>

        {error === 'no_club' && !vercelDemo && (
          <div className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100">
            <p className="font-semibold">Tu usuario no está vinculado a ningún club.</p>
            <p className="mt-2 text-amber-100/90">
              Usa el botón de arriba (modo demo) o vincula <code className="text-white">synq_staff</code>{' '}
              en Supabase.
            </p>
          </div>
        )}

        {!vercelDemo && (
          <div className="mt-8">
            <Suspense fallback={<p className="text-sm text-synq-muted">…</p>}>
              <LoginForm dict={dict} />
            </Suspense>
          </div>
        )}

        {vercelDemo && (
          <p className="mt-6 text-center text-xs text-synq-muted">
            Login con email desactivado en pruebas. Lo activaremos en producción real.
          </p>
        )}
      </div>
    </div>
  );
}
