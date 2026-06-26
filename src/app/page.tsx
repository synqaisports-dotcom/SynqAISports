import {
  ArrowRight,
  Calculator,
  LogIn,
  Megaphone,
  Shield,
  Smartphone,
  Trophy,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { ClubCalculator } from '@/components/ClubCalculator';
import { FoundingForm } from '@/components/public/FoundingForm';
import { PublicHeader } from '@/components/public/PublicHeader';
import { isDemoModeEnv } from '@/lib/demo';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { getLocale } from '@/lib/i18n/get-locale';

const modules = [
  {
    icon: Smartphone,
    title: 'App entrenadores',
    titleEn: 'Coach app',
    text: 'Pizarra táctica, convocatorias y planificación. Gancho gratuito con funciones premium.',
    textEn: 'Tactical board, call-ups and planning. Free hook with premium features.',
  },
  {
    icon: Users,
    title: 'App familias',
    titleEn: 'Families app',
    text: 'Avisos, horarios y comunicación del club. Multiplica impresiones y retención.',
    textEn: 'Notices, schedules and club communication. More impressions and retention.',
  },
  {
    icon: Megaphone,
    title: 'Publicidad inteligente',
    titleEn: 'Smart ads',
    text: 'Los ingresos por ads cubren primero la cuota SynqAI. El sobrante se reparte con el club.',
    textEn: 'Ad revenue covers SynqAI fees first. Surplus is shared with the club.',
  },
  {
    icon: Trophy,
    title: 'Torneos y pantallas',
    titleEn: 'Tournaments & screens',
    text: 'Calculador de competiciones y digital signage — picos de tráfico en días de partido.',
    textEn: 'Competition builder and digital signage — traffic peaks on match days.',
  },
];

export default async function SynqHomePage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const isEn = locale === 'en';
  const portalHref = isDemoModeEnv() ? '/portal' : '/demo';
  const portalLabel = isDemoModeEnv()
    ? 'Entrar al portal de pruebas'
    : dict.hero.ctaPortal;

  return (
    <div className="min-h-screen bg-synq-navy">
      <PublicHeader
        dict={dict}
        locale={locale}
        portalHref={portalHref}
        portalLabel={portalLabel}
      />

      <main>
        <section className="mx-auto max-w-5xl px-6 py-12 md:py-20">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="mb-4 text-sm font-medium tracking-widest text-synq-accent uppercase">
                {dict.hero.tag}
              </p>
              <h1 className="font-serif-display text-4xl leading-tight text-white md:text-5xl">
                {dict.hero.title}
              </h1>
              <p className="mt-6 text-lg text-synq-muted leading-relaxed">{dict.hero.body}</p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href={portalHref}
                  className="inline-flex items-center gap-2 rounded-full bg-synq-pitch px-6 py-3 text-sm font-semibold text-white hover:bg-synq-accent transition-colors"
                >
                  {portalLabel}
                  <LogIn className="h-4 w-4" />
                </Link>
                <a
                  href="#calculadora"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white hover:border-synq-accent/50 transition-colors"
                >
                  {dict.hero.ctaCalc}
                  <Calculator className="h-4 w-4" />
                </a>
                <a
                  href="#founding"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white hover:border-synq-accent/50 transition-colors"
                >
                  {dict.hero.ctaFounding}
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-synq-slate/50 shadow-2xl">
              <div className="aspect-video bg-black">
                <video
                  className="h-full w-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3Crect fill='%230a1628' width='16' height='9'/%3E%3Ctext x='8' y='5' text-anchor='middle' fill='%2322c55e' font-size='1' font-family='sans-serif'%3ESynqAI%3C/text%3E%3C/svg%3E"
                >
                  <source
                    src="https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
                    type="video/mp4"
                  />
                </video>
              </div>
              <p className="px-4 py-2 text-center text-xs text-synq-muted">
                {isEn ? 'Demo reel — replace with SynqAI product video' : 'Vídeo demo — sustituir por reel del producto SynqAI'}
              </p>
            </div>
          </div>
        </section>

        <section id="modelo" className="border-y border-white/5 bg-synq-slate/40">
          <div className="mx-auto max-w-5xl px-6 py-16">
            <h2 className="font-serif-display text-3xl text-white">
              {isEn ? 'How the money flows' : 'Cómo funciona el dinero'}
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {(isEn
                ? [
                    { step: '1', title: 'Family → Club', text: 'The club charges upfront: €12 or €24 per player per year.' },
                    { step: '2', title: 'Club → SynqAI', text: 'Monthly billing per active user. PPP scale from €0.50 to €1.00.' },
                    { step: '3', title: 'Ads → Split', text: 'Ads cover SynqAI first. Surplus: 40% to the club.' },
                  ]
                : [
                    { step: '1', title: 'Familia → Club', text: 'El club cobra por adelantado: 12 € o 24 €/año por jugador.' },
                    { step: '2', title: 'Club → SynqAI', text: 'Facturación mensual por usuario. Escala PPP: 0,50 € a 1,00 €.' },
                    { step: '3', title: 'Ads → Reparto', text: 'La publicidad cubre primero SynqAI. Sobrante: 40 % al club.' },
                  ]
              ).map(({ step, title, text }) => (
                <article
                  key={step}
                  className="rounded-2xl border border-white/5 bg-synq-navy/60 p-6"
                >
                  <span className="font-mono text-xs text-synq-accent">
                    {isEn ? `Step ${step}` : `Paso ${step}`}
                  </span>
                  <h3 className="mt-2 text-lg font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm text-synq-muted leading-relaxed">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="calculadora" className="mx-auto max-w-5xl px-6 py-20">
          <div className="mb-8 flex items-center gap-2">
            <Calculator className="h-6 w-6 text-synq-accent" />
            <h2 className="font-serif-display text-3xl text-white">{dict.nav.calculator}</h2>
          </div>
          <ClubCalculator />
        </section>

        <section id="founding" className="border-t border-white/5 bg-synq-slate/30">
          <div className="mx-auto max-w-5xl px-6 py-16">
            <h2 className="font-serif-display text-3xl text-white">{dict.founding.title}</h2>
            <p className="mt-2 max-w-2xl text-synq-muted">{dict.founding.subtitle}</p>
            <div className="mt-8">
              <FoundingForm dict={dict} />
            </div>
          </div>
        </section>

        <section id="modulos" className="border-t border-white/5">
          <div className="mx-auto max-w-5xl px-6 py-16">
            <h2 className="font-serif-display text-3xl text-white">
              {isEn ? 'Ecosystem' : 'Ecosistema'}
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {modules.map(({ icon: Icon, title, titleEn, text, textEn }) => (
                <article
                  key={title}
                  className="rounded-2xl border border-white/5 bg-synq-navy/50 p-6"
                >
                  <Icon className="mb-4 h-8 w-8 text-synq-accent" />
                  <h3 className="text-lg font-semibold text-white">{isEn ? titleEn : title}</h3>
                  <p className="mt-2 text-sm text-synq-muted leading-relaxed">
                    {isEn ? textEn : text}
                  </p>
                </article>
              ))}
            </div>
            <p className="mt-8 flex items-center gap-2 text-sm text-synq-muted">
              <Shield className="h-4 w-4 text-synq-accent" />
              {isEn
                ? 'MVP: coach app + families + club portal.'
                : 'MVP: app entrenador + familias + portal club.'}
            </p>
          </div>
        </section>

        <section id="nosotros" className="border-t border-white/5 bg-synq-slate/20">
          <div className="mx-auto max-w-5xl px-6 py-16">
            <h2 className="font-serif-display text-3xl text-white">{dict.about.title}</h2>
            <p className="mt-4 max-w-3xl text-synq-muted leading-relaxed">{dict.about.body}</p>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 py-8 text-center text-xs text-synq-muted">
        © {new Date().getFullYear()} SynqAI Sports · Nexus Labs
      </footer>
    </div>
  );
}
