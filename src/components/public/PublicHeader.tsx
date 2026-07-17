'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogIn } from 'lucide-react';
import { SynqBrandLockup } from '@/components/brand/SynqBrandLockup';
import type { Dictionary, Locale } from '@/lib/i18n/dictionaries';
import { DEMO_ENTRY_PATH } from '@/lib/demo-constants';

type Props = {
  dict: Dictionary;
  locale: Locale;
  portalHref?: string;
  portalLabel?: string;
};

export function PublicHeader({
  dict,
  locale,
  portalHref = DEMO_ENTRY_PATH,
  portalLabel = 'Portal demo',
}: Props) {
  const router = useRouter();
  const otherLocale: Locale = locale === 'es' ? 'en' : 'es';

  function setLocale(next: Locale) {
    document.cookie = `synq_locale=${next};path=/;max-age=31536000`;
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 synq-glass">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3.5">
        <Link href="/" className="min-w-0 shrink-0">
          <SynqBrandLockup
            layout="horizontal"
            iconSize={40}
            wordmarkSize="lg"
            showTagline
            showSportsSuffix
            className="items-center"
          />
        </Link>
        <div className="flex items-center gap-3">
          <Link href={portalHref} className="synq-btn-primary shrink-0 !px-4 !py-2">
            <LogIn className="h-4 w-4" />
            <span className="hidden sm:inline">{portalLabel}</span>
            <span className="sm:hidden">Portal</span>
          </Link>
          <nav className="hidden items-center gap-5 text-sm text-synq-muted lg:flex">
            <a href="#modelo" className="transition-colors hover:text-white">
              {dict.nav.model}
            </a>
            <a href="#calculadora" className="transition-colors hover:text-white">
              {dict.nav.calculator}
            </a>
            <a href="#modulos" className="transition-colors hover:text-white">
              {dict.nav.modules}
            </a>
            <a href="#founding" className="transition-colors hover:text-white">
              {dict.nav.founding}
            </a>
            <a href="#nosotros" className="transition-colors hover:text-white">
              {dict.nav.about}
            </a>
            <button
              type="button"
              onClick={() => setLocale(otherLocale)}
              className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs uppercase transition-colors hover:border-synq-accent/50"
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
