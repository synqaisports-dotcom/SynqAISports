import Link from 'next/link';
import {
  ArrowRight,
  Calculator,
  LogIn,
  Megaphone,
  Shield,
  Smartphone,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import { ClubCalculator } from '@/components/ClubCalculator';
import { FoundingForm } from '@/components/public/FoundingForm';
import { PublicHeader } from '@/components/public/PublicHeader';
import { DEMO_ENTRY_PATH } from '@/lib/demo-constants';
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

const stats = [
  { value: '12–24 €', label: 'Cuota familiar / año', labelEn: 'Family fee / year' },
  { value: '0,50 €', label: 'SynqAI desde / usuario', labelEn: 'SynqAI from / user' },
  { value: '40 %', label: 'Sobrante ads al club', labelEn: 'Ad surplus to club' },
];

export default async function SynqHomePage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const isEn = locale === 'en';

  return (
    <div className="min-h-screen synq-mesh-bg">
      <PublicHeader dict={dict} locale={locale} portalHref={DEMO_ENTRY_PATH} portalLabel={dict.hero.ctaPortal} />

      <main>
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.08),transparent_70%)]" />
          <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-24">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="synq-brand-label mb-4 inline-flex items-center gap-2 rounded-full border border-synq-accent/30 bg-synq-accent/10 px-3 py-1">
                  <Zap className="h-3.5 w-3.5" />
                  {dict.hero.tag}
                </p>
                <h1 className="font-serif-display text-4xl leading-[1.08] md:text-6xl">
                  <span className="synq-gradient-text">{dict.hero.title}</span>
                </h1>
                <p className="mt-6 max-w-xl text-lg text-synq-muted leading-relaxed">{dict.hero.body}</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href={DEMO_ENTRY_PATH} className="synq-btn-primary">
                    {dict.hero.ctaPortal}
                    <LogIn className="h-4 w-4" />
                  </Link>
                  <a href="#calculadora" className="synq-btn-ghost">
                    {dict.hero.ctaCalc}
                    <Calculator className="h-4 w-4" />
                  </a>
                  <a href="#founding" className="synq-btn-ghost">
                    {dict.hero.ctaFounding}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
                <div className="mt-10 grid grid-cols-3 gap-3">
                  {stats.map(({ value, label, labelEn }) => (
                    <div key={value} className="synq-glass rounded-xl px-3 py-3 text-center">
                      <p className="text-lg font-bold text-white">{value}</p>
                      <p className="mt-1 text-[10px] leading-tight text-synq-muted">
                        {isEn ? labelEn : label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="synq-card overflow-hidden shadow-2xl shadow-black/40">
                <div className="border-b border-white/10 bg-synq-slate/60 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                    <span className="ml-2 text-xs text-synq-muted">portal.synqai.net — demo</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-px bg-white/5 p-4">
                  {['Cantera', 'Metodología', 'Club'].map((item) => (
                    <div key={item} className="rounded-lg bg-synq-navy/80 p-3 text-center text-xs text-synq-muted">
                      {item}
                    </div>
                  ))}
                </div>
                <div className="aspect-video bg-gradient-to-br from-synq-slate to-synq-navy p-6">
                  <div className="grid h-full grid-cols-2 gap-3">
                    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                      <p className="text-[10px] uppercase tracking-wider text-synq-muted">Jugadores</p>
                      <p className="mt-2 text-3xl font-bold text-white">80</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                      <p className="text-[10px] uppercase tracking-wider text-synq-muted">Ejercicios</p>
                      <p className="mt-2 text-3xl font-bold text-synq-accent">24</p>
                    </div>
                    <div className="col-span-2 rounded-xl border border-synq-accent/20 bg-synq-accent/5 p-4">
                      <p className="text-sm text-white">Fichas UEFA · Microciclos · PDF</p>
                      <p className="mt-1 text-xs text-synq-muted">
                        {isEn ? 'Try the club portal without login' : 'Prueba el portal del club sin login'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="modelo" className="border-y border-white/5 bg-synq-slate/30">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="font-serif-display text-3xl text-white md:text-4xl">
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
                <article key={step} className="synq-card-hover p-6">
                  <span className="font-mono text-xs font-semibold text-synq-accent">
                    {isEn ? `Step ${step}` : `Paso ${step}`}
                  </span>
                  <h3 className="mt-2 text-lg font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm text-synq-muted leading-relaxed">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="calculadora" className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-8 flex items-center gap-2">
            <Calculator className="h-6 w-6 text-synq-accent" />
            <h2 className="font-serif-display text-3xl text-white">{dict.nav.calculator}</h2>
          </div>
          <ClubCalculator />
        </section>

        <section id="founding" className="border-t border-white/5 bg-synq-slate/20">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="font-serif-display text-3xl text-white">{dict.founding.title}</h2>
            <p className="mt-2 max-w-2xl text-synq-muted">{dict.founding.subtitle}</p>
            <div className="mt-8">
              <FoundingForm dict={dict} />
            </div>
          </div>
        </section>

        <section id="modulos" className="border-t border-white/5">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="font-serif-display text-3xl text-white">
              {isEn ? 'Ecosystem' : 'Ecosistema'}
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {modules.map(({ icon: Icon, title, titleEn, text, textEn }) => (
                <article key={title} className="synq-card-hover group p-6">
                  <div className="mb-4 inline-flex rounded-xl bg-synq-pitch/15 p-3 transition-colors group-hover:bg-synq-pitch/25">
                    <Icon className="h-7 w-7 text-synq-accent" />
                  </div>
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
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="font-serif-display text-3xl text-white">{dict.about.title}</h2>
            <p className="mt-4 max-w-3xl text-synq-muted leading-relaxed">{dict.about.body}</p>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 py-8 text-center text-xs text-synq-muted">
        © {new Date().getFullYear()} SynqAI · Club & Tactics Platform
      </footer>
    </div>
  );
}
