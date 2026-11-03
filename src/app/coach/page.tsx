import Link from 'next/link';
import { PublicHeader } from '@/components/public/PublicHeader';
import { CoachTabletMock } from '@/components/coach/CoachTabletMock';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { getLocale } from '@/lib/i18n/get-locale';

const points = [
  'Pizarra de partido, ejercicios, equipo y temporada.',
  'Fútbol y fútbol sala usan la pizarra de la plataforma.',
  'Baloncesto, balonmano, voleibol y waterpolo ya se eligen; su campo llega después.',
  'Hasta 20 ejercicios para dos meses.',
  'Jugadores con nombre, dorsal y posición.',
  'Los dibujos se quedan en tu aparato. El alta sí queda registrada en SynqAI.',
];

export default async function CoachFreeInfoPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <>
      <PublicHeader dict={dict} locale={locale} />
      <main className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 lg:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-synq-accent">Módulo</p>
          <h1 className="mt-3 font-serif-display text-4xl text-white md:text-5xl">SynqAI Coach Touch Free</h1>
          <p className="mt-4 max-w-xl text-synq-muted">
            La pizarra del entrenador que todavía no está en un club. Se abre en el navegador o se instala como
            aplicación en el móvil y en la tablet. No está conectada al portal del club.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-synq-muted">
            {points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/coach/acceso" className="synq-btn-primary">
              Entrar o crear cuenta
            </Link>
            <Link href="/coach/acceso" className="synq-btn-ghost">
              Instalar la PWA
            </Link>
          </div>
          <p className="mt-4 max-w-xl text-xs text-synq-muted">
            Al crear la cuenta entras enseguida. SynqAI guarda tu nombre, email, país y un código de acceso para
            poder reenviártelo. La pizarra, los jugadores y los partidos no salen de tu aparato.
          </p>
        </div>
        <CoachTabletMock />
      </main>
    </>
  );
}
