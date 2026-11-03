import Link from 'next/link';
import {
  ArrowRight,
  LogIn,
  Megaphone,
  Shield,
  Smartphone,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import { SynqBrandLockup } from '@/components/brand/SynqBrandLockup';
import { FoundingForm } from '@/components/public/FoundingForm';
import { PublicHeader } from '@/components/public/PublicHeader';
import { DEMO_ENTRY_PATH } from '@/lib/demo-constants';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { getLocale } from '@/lib/i18n/get-locale';

const modules: {
  icon: typeof Smartphone;
  title: string;
  titleEn: string;
  text: string;
  textEn: string;
  href?: string;
}[] = [
  {
    icon: Smartphone,
    title: 'SynqAI Coach Touch Free',
    titleEn: 'SynqAI Coach Touch Free',
    href: '/coach',
    text: 'Pizarra gratuita para el entrenador sin club. Se abre en el navegador o se instala como PWA.',
    textEn: 'Free board for a coach without a club. Open it in the browser or install the PWA.',
  },
  {
    icon: Users,
    title: 'App familias',
    titleEn: 'Families app',
    text: 'Avisos, horarios y comunicación del club con las familias.',
    textEn: 'Notices, schedules and club communication with families.',
  },
  {
    icon: Megaphone,
    title: 'Publicidad inteligente',
    titleEn: 'Smart ads',
    text: 'Espacio publicitario en el entorno gratuito y en el del club.',
    textEn: 'Ad space in the free environment and in the club environment.',
  },
  {
    icon: Trophy,
    title: 'Torneos y pantallas',
    titleEn: 'Tournaments & screens',
    text: 'Competición, mesa, taquilla y pantallas del evento, como módulo del club.',
    textEn: 'Competition, table, gate and event screens, as a club module.',
  },
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
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.07),transparent_70%)]" />
          <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-24">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="synq-brand-label mb-4 inline-flex items-center gap-2 rounded-full border border-synq-accent/30 bg-synq-accent/10 px-3 py-1">
                  <Zap className="h-3.5 w-3.5" />
                  {dict.hero.tag}
                </p>
                <h1 className="font-brand text-4xl leading-[1.05] md:text-6xl">
                  <span className="synq-gradient-text">{dict.hero.title}</span>
                </h1>
                <p className="mt-6 max-w-xl text-lg text-synq-muted leading-relaxed">{dict.hero.body}</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href={DEMO_ENTRY_PATH} className="synq-btn-primary">
                    {dict.hero.ctaPortal}
                    <LogIn className="h-4 w-4" />
                  </Link>
                  <a href="#plataforma" className="synq-btn-ghost">
                    {isEn ? 'The platform' : 'La plataforma'}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <a href="#founding" className="synq-btn-ghost">
                    {dict.hero.ctaFounding}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>

              <div className="flex flex-col items-center gap-8 lg:items-end">
                <SynqBrandLockup
                  layout="stacked"
                  iconSize={112}
                  wordmarkSize="xl"
                  showTagline
                  className="hidden lg:flex"
                />
              <div className="synq-card w-full overflow-hidden shadow-2xl shadow-black/40">
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
          </div>
        </section>

        <section id="plataforma" className="border-y border-white/5 bg-synq-slate/30">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="font-serif-display text-3xl text-white md:text-4xl">
              {isEn ? 'One platform, two ways in' : 'Una plataforma, dos entradas'}
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {(isEn
                ? [
                    { step: '1', title: 'Coach, on their own', text: 'A free app with the essentials: board, squad and a short planning cycle.' },
                    { step: '2', title: 'The club', text: 'The portal opens the full environment: academy, methodology, tournaments, gate and screens.' },
                    { step: '3', title: 'Enter', text: 'Clubs and staff sign in to the platform. The public site stays here, as information.' },
                  ]
                : [
                    { step: '1', title: 'Entrenador, por su cuenta', text: 'Una app gratuita con lo esencial: pizarra, plantilla y una planificación corta.' },
                    { step: '2', title: 'El club', text: 'El portal abre el entorno completo: cantera, metodología, torneos, taquilla y pantallas.' },
                    { step: '3', title: 'Entrar', text: 'El club y su staff acceden a la plataforma. Esta web se queda como información.' },
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
            <div className="mt-8">
              <Link href={DEMO_ENTRY_PATH} className="synq-btn-primary">
                {dict.hero.ctaPortal}
                <LogIn className="h-4 w-4" />
              </Link>
            </div>
          </div>
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
              {modules.map(({ icon: Icon, title, titleEn, text, textEn, href }) => (
                <article key={title} className="synq-card-hover group p-6">
                  <div className="mb-4 inline-flex rounded-xl bg-synq-pitch/15 p-3 transition-colors group-hover:bg-synq-pitch/25">
                    <Icon className="h-7 w-7 text-synq-accent" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{isEn ? titleEn : title}</h3>
                  <p className="mt-2 text-sm text-synq-muted leading-relaxed">
                    {isEn ? textEn : text}
                  </p>
                  {href ? (
                    <Link href={href} className="mt-4 inline-flex text-sm text-synq-accent">
                      Ver módulo
                    </Link>
                  ) : null}
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
