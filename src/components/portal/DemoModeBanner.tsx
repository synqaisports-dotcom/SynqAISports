import Link from 'next/link';
import { DEMO_ENTRY_PATH } from '@/lib/demo-constants';

type Props = {
  canPersist: boolean;
  clubName?: string;
};

export function DemoModeBanner({ canPersist, clubName }: Props) {
  return (
    <div className="border-b border-amber-500/30 bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent px-4 py-2.5 text-center text-sm text-amber-50">
      <strong>Modo pruebas</strong>
      {clubName ? ` — ${clubName}` : ''}. Sin contraseña.
      {canPersist ? (
        <span> Los cambios se guardan en Supabase.</span>
      ) : (
        <span className="text-amber-100/90">
          {' '}
          Vista previa: añade SUPABASE_SERVICE_ROLE_KEY en Vercel para guardar datos.
        </span>
      )}{' '}
      <Link href="/" className="font-medium underline underline-offset-2 hover:text-white">
        Web pública
      </Link>
      {' · '}
      <Link href={DEMO_ENTRY_PATH} className="font-medium underline underline-offset-2 hover:text-white">
        Renovar sesión demo
      </Link>
    </div>
  );
}
