import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SynqBrandLockup } from '@/components/brand/SynqBrandLockup';
import { FamilyLoginForm } from '@/components/familias/FamilyLoginForm';
import { getFamilyContext } from '@/lib/family-auth';
import { isDemoActive } from '@/lib/demo';

export default async function FamiliasLoginPage() {
  const family = await getFamilyContext();
  if (family) redirect('/familias');

  const demo = await isDemoActive();

  return (
    <div className="flex min-h-screen items-center justify-center bg-synq-navy px-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-synq-slate/40 p-8">
        <SynqBrandLockup layout="stacked" iconSize={72} wordmarkSize="md" className="mb-6" />
        <h1 className="text-2xl font-semibold text-white">Portal de familias</h1>
        <p className="mt-2 text-sm text-synq-muted">
          Accede con el email registrado como tutor o jugador mayor en el club.
        </p>

        {demo ? (
          <div className="mt-6 space-y-3">
            <Link
              href="/demo?next=/familias"
              className="flex w-full items-center justify-center rounded-full bg-gradient-to-r from-synq-pitch to-synq-accent py-3 text-sm font-semibold text-white"
            >
              Entrar como familia demo
            </Link>
            <p className="text-center text-xs text-synq-muted">
              Tutor demo: Ana Castro · Jugador: Alejandro Castro
            </p>
          </div>
        ) : (
          <div className="mt-6">
            <FamilyLoginForm />
          </div>
        )}

        <p className="mt-6 text-center text-sm text-synq-muted">
          ¿Primera vez?{' '}
          <Link href="/join" className="text-synq-accent hover:underline">
            Vincular con código del club
          </Link>
        </p>
      </div>
    </div>
  );
}
