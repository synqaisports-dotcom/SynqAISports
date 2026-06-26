'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogIn } from 'lucide-react';
import type { Dictionary, Locale } from '@/lib/i18n/dictionaries';

const demoMode = process.env.NEXT_PUBLIC_SYNQ_DEMO_MODE === 'true';

type Props = {
  dict: Dictionary;
  locale: Locale;
};

export function PublicHeader({ dict, locale }: Props) {
  const router = useRouter();
  const otherLocale: Locale = locale === 'es' ? 'en' : 'es';

  function setLocale(next: Locale) {
    document.cookie = `synq_locale=${next};path=/;max-age=31536000`;
    router.refresh();
  }

  return (
    <header className="border-b border-white/5">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-synq-muted">
            Nexus Labs
          </p>
          <Link href="/" className="text-lg font-bold text-white">
            SynqAI Sports
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={demoMode ? '/portal' : '/login'}
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-synq-pitch px-4 py-2 text-sm font-semibold text-white hover:bg-synq-accent transition-colors"
          >
            <LogIn className="h-4 w-4" />
            <span className="hidden sm:inline">{demoMode ? 'Portal demo' : dict.nav.login}</span>
            <span className="sm:hidden">{demoMode ? 'Demo' : 'Portal'}</span>
          </Link>
          <nav className="hidden items-center gap-5 text-sm text-synq-muted lg:flex">
          <a href="#modelo" className="hover:text-white transition-colors">
            {dict.nav.model}
          </a>
          <a href="#calculadora" className="hover:text-white transition-colors">
            {dict.nav.calculator}
          </a>
          <a href="#modulos" className="hover:text-white transition-colors">
            {dict.nav.modules}
          </a>
          <a href="#founding" className="hover:text-white transition-colors">
            {dict.nav.founding}
          </a>
          <a href="#nosotros" className="hover:text-white transition-colors">
            {dict.nav.about}
          </a>
          <button
            type="button"
            onClick={() => setLocale(otherLocale)}
            className="rounded border border-white/10 px-2 py-0.5 text-xs uppercase hover:border-synq-accent/50"
            aria-label="Change language"
          >
            {otherLocale}
          </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
