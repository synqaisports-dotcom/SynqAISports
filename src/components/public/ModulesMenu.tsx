'use client';

import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

export function ModulesMenu({ label }: { label: string }) {
  return (
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-1 transition-colors hover:text-white">
        {label}
        <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
      </summary>
      <div className="absolute right-0 z-20 mt-3 w-64 rounded-xl border border-white/10 bg-synq-navy/95 p-2 shadow-2xl shadow-black/40">
        <Link
          href="/coach"
          className="block rounded-lg px-3 py-2 text-sm text-white hover:bg-white/5"
        >
          <span className="block font-medium">SynqAI Coach Touch Free</span>
          <span className="mt-0.5 block text-xs text-synq-muted">Pizarra gratuita para el entrenador sin club</span>
        </Link>
      </div>
    </details>
  );
}
