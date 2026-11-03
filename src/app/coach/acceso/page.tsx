import Link from 'next/link';
import { CoachFreeAuthForm } from '@/components/coach/CoachFreeAuthForm';
import { PublicHeader } from '@/components/public/PublicHeader';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { getLocale } from '@/lib/i18n/get-locale';

export default async function CoachFreeAccessPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <>
      <PublicHeader dict={dict} locale={locale} />
      <main className="mx-auto grid max-w-5xl gap-10 px-6 py-16 lg:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-synq-accent">Coach Touch Free</p>
          <h1 className="mt-3 font-serif-display text-4xl text-white">Tu acceso a la pizarra</h1>
          <p className="mt-4 text-synq-muted">
            Crea la cuenta o entra con el email. Desde aquí se abre la PWA. Si la instalas en la pantalla de inicio,
            el siguiente acceso abre directamente tu pizarra.
          </p>
          <p className="mt-4 text-sm text-synq-muted">
            <Link href="/coach/app" className="text-synq-accent">
              Abrir la pizarra
            </Link>
            <span className="mx-2 text-white/20">·</span>
            <Link href="/coach" className="text-synq-accent">
              Volver a la información del módulo
            </Link>
          </p>
        </div>
        <CoachFreeAuthForm />
      </main>
    </>
  );
}
