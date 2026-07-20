import Link from 'next/link';
import { SynqBrandLockup } from '@/components/brand/SynqBrandLockup';
import { JoinClubForm } from '@/components/familias/JoinClubForm';
import { isDemoModeEnv } from '@/lib/demo-constants';

type Props = {
  searchParams: Promise<{ code?: string }>;
};

export default async function JoinClubPage({ searchParams }: Props) {
  const { code } = await searchParams;
  const demo = isDemoModeEnv();

  return (
    <div className="flex min-h-screen items-center justify-center bg-synq-navy px-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-synq-slate/40 p-8">
        <SynqBrandLockup layout="stacked" iconSize={72} wordmarkSize="md" className="mb-6" />
        <h1 className="text-2xl font-semibold text-white">Vincular al club</h1>
        <p className="mt-2 text-sm text-synq-muted">
          Introduce el código del club y el email con el que estás registrado como tutor o
          jugador mayor.
        </p>

        {demo ? (
          <div className="mt-6 space-y-3">
            <JoinClubForm initialCode={code ?? 'DEMO2026'} />
            <p className="text-center text-xs text-synq-muted">
              Demo: código <strong>DEMO2026</strong> · email{' '}
              <strong>ana.castro@email.com</strong>
            </p>
          </div>
        ) : (
          <div className="mt-6">
            <JoinClubForm initialCode={code ?? ''} />
          </div>
        )}

        <p className="mt-6 text-center text-sm text-synq-muted">
          ¿Ya tienes acceso?{' '}
          <Link href="/familias/login" className="text-synq-accent hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
