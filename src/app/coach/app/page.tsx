import Link from 'next/link';
import { redirect } from 'next/navigation';
import { logoutCoachFree, currentCoachFree } from '@/app/actions/coach-free';
import { CoachTabletMock } from '@/components/coach/CoachTabletMock';
import { countryName } from '@/lib/coach-free-countries';

const areas = [
  { title: 'Pizarra de ejercicios', text: 'Hasta 20 ejercicios para dos meses.' },
  { title: 'Formación', text: 'Fútbol 7 o fútbol sala, con tu plantilla.' },
  { title: 'Jugadores', text: 'Nombre, dorsal y posición. Sin ficha extra.' },
  { title: 'Temporada', text: 'Resultados de tus partidos, en este aparato.' },
];

export default async function CoachFreeAppPage() {
  const coach = await currentCoachFree();
  if (!coach) redirect('/coach/acceso');

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
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

      <div className="mt-8 grid items-center gap-8 lg:grid-cols-2">
        <CoachTabletMock />
        <div className="grid gap-3">
          {areas.map((area) => (
            <article key={area.title} className="synq-card p-4">
              <h2 className="font-semibold text-white">{area.title}</h2>
              <p className="mt-1 text-sm text-synq-muted">{area.text}</p>
            </article>
          ))}
          <p className="text-sm text-synq-muted">
            La pizarra se guarda en este aparato. SynqAI solo conserva el alta para saber cuántas Free hay y poder
            reenviar el código. <Link href="/coach" className="text-synq-accent">Ver el módulo</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
