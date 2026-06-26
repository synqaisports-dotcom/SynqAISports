import Link from 'next/link';

type Props = {
  canPersist: boolean;
  clubName?: string;
};

export function DemoModeBanner({ canPersist, clubName }: Props) {
  return (
    <div
      className="border-b border-amber-500/40 bg-amber-500/15 px-4 py-2 text-center text-sm"
      style={{ color: '#fef3c7' }}
    >
      <strong>Entorno de pruebas</strong>
      {clubName ? ` — ${clubName}` : ''}. Sin login.
      {canPersist ? (
        <span> Los cambios se guardan en Supabase.</span>
      ) : (
        <span className="text-amber-200">
          {' '}
          Solo lectura: añade SUPABASE_SERVICE_ROLE_KEY en Vercel para guardar.
        </span>
      )}{' '}
      <Link href="/" className="underline hover:text-white">
        Web pública
      </Link>
    </div>
  );
}
