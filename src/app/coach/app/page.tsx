import Link from 'next/link';
import { redirect } from 'next/navigation';
import { logoutCoachFree, currentCoachFree } from '@/app/actions/coach-free';
import { CoachFreeDesk } from '@/components/coach/CoachFreeDesk';
import { countryName } from '@/lib/coach-free-countries';

export default async function CoachFreeAppPage() {
  const coach = await currentCoachFree();
  if (!coach) redirect('/coach/acceso');

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-synq-accent">SynqAI Coach Touch Free</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Hola, {coach.fullName}</h1>
          <p className="mt-2 text-sm text-synq-muted">
            {countryName(coach.countryCode)} · Código de acceso <span className="font-mono text-white">{coach.accessCode}</span>
          </p>
        </div>
        <form action={logoutCoachFree}>
          <button type="submit" className="synq-btn-ghost">
            Salir
          </button>
        </form>
      </div>
      <CoachFreeDesk />
      <p className="mt-6 text-sm text-synq-muted">
        La pizarra, el equipo y la temporada se quedan en este aparato. SynqAI solo conserva el alta.{' '}
        <Link href="/coach" className="text-synq-accent">
          Ver el módulo
        </Link>
      </p>
    </main>
  );
}
