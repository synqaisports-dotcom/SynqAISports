import Link from 'next/link';
import {
  ArrowRight,
  Calculator,
  Megaphone,
  Shield,
  Smartphone,
  Trophy,
  Users,
} from 'lucide-react';
import { ClubCalculator } from '@/components/ClubCalculator';

const modules = [
  {
    icon: Smartphone,
    title: 'App entrenadores',
    text: 'Pizarra táctica, convocatorias y planificación. Gancho gratuito con funciones premium.',
  },
  {
    icon: Users,
    title: 'App familias',
    text: 'Avisos, horarios y comunicación del club. Multiplica impresiones y retención.',
  },
  {
    icon: Megaphone,
    title: 'Publicidad inteligente',
    text: 'Los ingresos por ads cubren primero la cuota SynqAI. El sobrante se reparte con el club.',
  },
  {
    icon: Trophy,
    title: 'Torneos y pantallas',
    text: 'Calculador de competiciones y digital signage — picos de tráfico en días de partido.',
  },
];

export default function SynqHomePage() {
  return (
    <div className="min-h-screen bg-synq-navy">
      <header className="border-b border-white/5">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-synq-muted">
              Nexus Labs
            </p>
            <span className="text-lg font-bold text-white">SynqAI Sports</span>
          </div>
          <nav className="hidden gap-6 text-sm text-synq-muted sm:flex">
            <a href="#modelo" className="hover:text-white transition-colors">
              Modelo
            </a>
            <a href="#calculadora" className="hover:text-white transition-colors">
              Calculadora
            </a>
            <a href="#modulos" className="hover:text-white transition-colors">
              Módulos
            </a>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-5xl px-6 py-20 md:py-28">
          <p className="mb-4 text-sm font-medium tracking-widest text-synq-accent uppercase">
            Plataforma 360 para clubes
          </p>
          <h1 className="font-serif-display max-w-3xl text-4xl leading-tight text-white md:text-6xl">
            El club cobra a las familias. SynqAI cobra al club. Todos ganan.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-synq-muted leading-relaxed">
            Ecosistema digital para fútbol base y multi-deporte: entrenadores, padres, pantallas y
            gestión. El club fija el precio familiar —{' '}
            <strong className="text-white">12 € o 24 € al año por niño</strong> — y retiene el
            margen sobre la cuota SynqAI desde <strong className="text-white">0,50 €/usuario/mes</strong>.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="#calculadora"
              className="inline-flex items-center gap-2 rounded-full bg-synq-pitch px-6 py-3 text-sm font-semibold text-white hover:bg-synq-accent transition-colors"
            >
              Simular ingresos del club
              <Calculator className="h-4 w-4" />
            </a>
            <a
              href="mailto:hello@synqai.net?subject=Piloto%20club"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white hover:border-synq-accent/50 transition-colors"
            >
              Solicitar piloto
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>

        <section id="modelo" className="border-y border-white/5 bg-synq-slate/40">
          <div className="mx-auto max-w-5xl px-6 py-16">
            <h2 className="font-serif-display text-3xl text-white">Cómo funciona el dinero</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {[
                {
                  step: '1',
                  title: 'Familia → Club',
                  text: 'El club cobra por adelantado lo que decida: 1 €/mes (12 €/año) o 2 €/mes (24 €/año) por jugador.',
                },
                {
                  step: '2',
                  title: 'Club → SynqAI',
                  text: 'Facturación mensual por usuario activo. Escala PPP: desde 0,50 € (club grande) hasta 1,00 € (club pequeño).',
                },
                {
                  step: '3',
                  title: 'Ads → Reparto',
                  text: 'La publicidad cubre primero la cuota SynqAI. Si sobra, el club recibe el 40 % del excedente.',
                },
              ].map(({ step, title, text }) => (
                <article
                  key={step}
                  className="rounded-2xl border border-white/5 bg-synq-navy/60 p-6"
                >
                  <span className="font-mono text-xs text-synq-accent">Paso {step}</span>
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
            <h2 className="font-serif-display text-3xl text-white">Calculadora club</h2>
          </div>
          <ClubCalculator />
        </section>

        <section id="modulos" className="border-t border-white/5 bg-synq-slate/30">
          <div className="mx-auto max-w-5xl px-6 py-16">
            <h2 className="font-serif-display text-3xl text-white">Ecosistema</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {modules.map(({ icon: Icon, title, text }) => (
                <article
                  key={title}
                  className="rounded-2xl border border-white/5 bg-synq-navy/50 p-6"
                >
                  <Icon className="mb-4 h-8 w-8 text-synq-accent" />
                  <h3 className="text-lg font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm text-synq-muted leading-relaxed">{text}</p>
                </article>
              ))}
            </div>
            <p className="mt-8 flex items-center gap-2 text-sm text-synq-muted">
              <Shield className="h-4 w-4 text-synq-accent" />
              MVP en desarrollo: pizarra entrenador + avisos padres + panel club.
            </p>
          </div>
        </section>

        <section className="border-t border-white/5">
          <div className="mx-auto max-w-5xl px-6 py-12 text-center text-sm text-synq-muted">
            <p>
              SynqAI Sports es un producto de{' '}
              <span className="text-white">Nexus Labs</span>. TrendPulse (inteligencia de
              tendencias) es un producto separado con su propia infraestructura.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 py-8 text-center text-xs text-synq-muted">
        © {new Date().getFullYear()} SynqAI Sports · Nexus Labs
      </footer>
    </div>
  );
}
