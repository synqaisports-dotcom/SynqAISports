'use client';

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function PortalError({ error, reset }: Props) {
  return (
    <div
      className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6"
      style={{ color: '#fecaca' }}
    >
      <h2 className="text-lg font-semibold" style={{ color: '#ffffff' }}>
        No se pudo cargar el portal
      </h2>
      <p className="mt-2 text-sm">{error.message || 'Error desconocido'}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-full bg-synq-pitch px-4 py-2 text-sm font-semibold text-white"
      >
        Reintentar
      </button>
    </div>
  );
}
