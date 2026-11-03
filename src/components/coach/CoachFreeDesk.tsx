'use client';

import Link from 'next/link';
import {
  CLUB_PRACTICED_SPORT_LABELS,
  CLUB_PRACTICED_SPORT_ORDER,
  PRACTICED_SPORT_DRAWING,
} from '@/lib/club-practiced-sports';
import { coachFreeBoardReady } from '@/lib/coach-free-device';
import { useCoachFreeSport } from '@/components/coach/use-coach-free-sport';

const doors = [
  { href: '/coach/app/partido', title: 'Pizarra de partido', text: 'Formación del equipo para el partido.' },
  { href: '/coach/app/ejercicios', title: 'Ejercicios', text: 'Hasta 20 dibujos para dos meses.' },
  { href: '/coach/app/equipo', title: 'Equipo', text: 'Nombre, dorsal y posición.' },
  { href: '/coach/app/temporada', title: 'Temporada', text: 'Resultados de tus partidos.' },
];

export function CoachFreeDesk() {
  const { sport, choose } = useCoachFreeSport();
  const boardReady = coachFreeBoardReady(sport);

  return (
    <div className="mt-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-synq-accent">Deporte</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {CLUB_PRACTICED_SPORT_ORDER.map((item) => {
          const active = item === sport;
          return (
            <button
              key={item}
              type="button"
              onClick={() => choose(item)}
              className={`rounded-full px-4 py-2 text-sm ${
                active ? 'bg-synq-accent font-semibold text-synq-navy' : 'border border-white/10 text-synq-muted'
              }`}
            >
              {CLUB_PRACTICED_SPORT_LABELS[item]}
            </button>
          );
        })}
      </div>
      <p className="mt-3 max-w-2xl text-sm text-synq-muted">
        {boardReady
          ? `${CLUB_PRACTICED_SPORT_LABELS[sport]} abre la pizarra de la plataforma. Lo que dibujes se queda en este aparato.`
          : PRACTICED_SPORT_DRAWING[sport].note}
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {doors.map((door) => (
          <Link key={door.href} href={door.href} className="synq-card-hover block p-5">
            <span className="block text-lg font-semibold text-white">{door.title}</span>
            <span className="mt-1 block text-sm text-synq-muted">{door.text}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
