import type { ReactNode } from 'react';
import Link from 'next/link';

export function CoachFreeSection({
  title,
  text,
  children,
}: {
  title: string;
  text?: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <Link href="/coach/app" className="text-sm text-synq-accent">
        Inicio
      </Link>
      <h1 className="mt-3 text-3xl font-semibold text-white">{title}</h1>
      {text ? <p className="mt-2 text-sm text-synq-muted">{text}</p> : null}
      <div className="mt-6">{children}</div>
    </main>
  );
}
