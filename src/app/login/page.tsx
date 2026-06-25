import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { getLocale } from '@/lib/i18n/get-locale';

export default async function LoginPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <div className="flex min-h-screen items-center justify-center bg-synq-navy px-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-synq-slate/40 p-8">
        <p className="text-[10px] uppercase tracking-widest text-synq-muted">Nexus Labs</p>
        <h1 className="mt-2 font-serif-display text-3xl text-white">{dict.login.title}</h1>
        <p className="mt-2 text-sm text-synq-muted">{dict.login.subtitle}</p>
        <div className="mt-8">
          <Suspense fallback={<p className="text-sm text-synq-muted">…</p>}>
            <LoginForm dict={dict} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
