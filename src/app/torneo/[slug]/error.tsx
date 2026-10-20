'use client';

import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function PublicTournamentError({ error, reset }: Props) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#060a12] px-4 text-center">
      <AlertTriangle className="size-12 text-amber-400" />
      <h1 className="mt-4 text-xl font-semibold text-white">No se pudo cargar el torneo</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Ha ocurrido un error al mostrar la web pública. Prueba de nuevo o vuelve al inicio.
      </p>
      {error.digest ? (
        <p className="mt-2 font-mono text-[10px] text-muted-foreground/70">Ref: {error.digest}</p>
      ) : null}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-black hover:bg-cyan-400"
        >
          Reintentar
        </button>
        <Link
          href="/torneo/demo"
          className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/5"
        >
          Hub demo
        </Link>
      </div>
    </div>
  );
}
