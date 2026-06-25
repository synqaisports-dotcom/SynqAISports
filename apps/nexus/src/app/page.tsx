import Link from 'next/link';
import { ArrowRight, Layers, Radar, Shield } from 'lucide-react';

const products = [
  {
    name: 'SynqAI Sports',
    tag: 'Activo',
    desc: 'Plataforma 360 para clubes: familias, entrenadores, ads y margen para el club.',
    href: 'https://www.synqai.net',
  },
  {
    name: 'TrendPulse',
    tag: 'Piloto interno',
    desc: 'Inteligencia de delay geográfico. Producto separado — deploy en rama trendpulse.',
    href: 'https://trendpulse.vercel.app',
  },
];

export default function NexusHomePage() {
  return (
    <div className="min-h-screen bg-nexus-navy">
      <header className="border-b border-white/5">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <span className="text-sm font-semibold tracking-[0.2em] text-white uppercase">
            Nexus Labs
          </span>
          <nav className="flex gap-8 text-sm text-nexus-muted">
            <a href="#productos" className="hover:text-white transition-colors">
              Productos
            </a>
            <a href="#enfoque" className="hover:text-white transition-colors">
              Enfoque
            </a>
            <a href="#contacto" className="hover:text-white transition-colors">
              Contacto
            </a>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-5xl px-6 py-24">
          <p className="mb-4 text-sm font-medium tracking-widest text-nexus-accent uppercase">
            Product studio
          </p>
          <h1 className="font-serif-display max-w-3xl text-5xl leading-tight text-white md:text-6xl">
            Construimos productos que llegan antes que el mercado.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-nexus-muted leading-relaxed">
            Nexus Labs es el sello matriz de aplicaciones con modelos de negocio propios:
            inteligencia comercial, retail ágil y software vertical donde el operador
            conoce el problema de primera mano.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="#productos"
              className="inline-flex items-center gap-2 rounded-full bg-nexus-accent px-6 py-3 text-sm font-semibold text-white hover:bg-blue-600 transition-colors"
            >
              Ver productos
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>

        <section id="enfoque" className="border-y border-white/5 bg-nexus-slate/40">
          <div className="mx-auto grid max-w-5xl gap-8 px-6 py-16 md:grid-cols-3">
            {[
              {
                icon: Radar,
                title: 'Señal antes que ruido',
                text: 'Cada producto resuelve un timing: cuándo actuar, no solo qué vender.',
              },
              {
                icon: Layers,
                title: 'Un sello, varias apps',
                text: 'URLs, auth y monetización independientes bajo una misma disciplina de ingeniería.',
              },
              {
                icon: Shield,
                title: 'Rigor operativo',
                text: 'Deploy continuo, datos versionados y MVPs medibles. Sin promesas vacías.',
              },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-white/5 bg-nexus-navy/60 p-6">
                <Icon className="mb-4 h-8 w-8 text-nexus-accent" />
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm text-nexus-muted leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="productos" className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="font-serif-display text-3xl text-white">Productos</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {products.map((p) => (
              <article
                key={p.name}
                className="group rounded-2xl border border-white/10 bg-nexus-slate/30 p-8 transition hover:border-nexus-accent/40"
              >
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-nexus-accent">
                  {p.tag}
                </span>
                <h3 className="mt-4 text-2xl font-semibold text-white">{p.name}</h3>
                <p className="mt-3 text-sm text-nexus-muted leading-relaxed">{p.desc}</p>
                <Link
                  href={p.href}
                  className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-nexus-accent group-hover:gap-2 transition-all"
                >
                  Explorar
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section id="contacto" className="border-t border-white/5">
          <div className="mx-auto max-w-5xl px-6 py-16 text-center">
            <h2 className="text-xl font-semibold text-white">Partnerships & contacto</h2>
            <p className="mt-2 text-nexus-muted">
              Escríbenos para pilotos B2B o distribución de productos validados.
            </p>
            <a
              href="mailto:hello@nexuslabs.io"
              className="mt-6 inline-block text-nexus-accent hover:underline"
            >
              hello@nexuslabs.io
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 py-8 text-center text-xs text-nexus-muted">
        © {new Date().getFullYear()} Nexus Labs. Todos los derechos reservados.
      </footer>
    </div>
  );
}
