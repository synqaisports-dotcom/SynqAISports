import Link from 'next/link';
import {
  ArrowRight,
  Calendar,
  ClipboardList,
  Smartphone,
  TrendingUp,
  Users,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { countActivePlayers, getStaffContext } from '@/lib/portal';
import { redirect } from 'next/navigation';

export default async function PortalHomePage() {
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const activePlayers = await countActivePlayers(supabase, ctx.club.id);
  const foundingBadge = ctx.club.is_founding
    ? 'Founding — año 1 sin cuota'
    : 'Club socio';

  const kpis = [
    {
      label: 'Jugadores activos',
      value: String(activePlayers),
      hint: `${ctx.club.players_count} de referencia`,
      icon: Users,
      accent: 'from-emerald-500/20 to-emerald-500/5',
    },
    {
      label: 'Cuota familiar',
      value: `${ctx.club.family_fee_annual_eur} €`,
      hint: 'Por jugador / año',
      icon: TrendingUp,
      accent: 'from-sky-500/20 to-sky-500/5',
    },
    {
      label: 'Tarifa SynqAI',
      value: `${ctx.club.synq_rate_per_user_eur} €`,
      hint: 'Por usuario / mes',
      icon: Smartphone,
      accent: 'from-violet-500/20 to-violet-500/5',
    },
    {
      label: 'Estado club',
      value: foundingBadge,
      hint: ctx.club.founding_until
        ? `Hasta ${new Date(ctx.club.founding_until).toLocaleDateString('es-ES')}`
        : 'Temporada actual',
      icon: Calendar,
      accent: 'from-amber-500/20 to-amber-500/5',
    },
  ];

  const quickLinks = [
    {
      href: '/portal/cantera',
      title: 'Cantera',
      text: 'Equipos, jugadores y categorías.',
      icon: Users,
    },
    {
      href: '/portal/metodologia',
      title: 'Metodología',
      text: 'Ejercicios, microciclos y fichas PDF.',
      icon: ClipboardList,
    },
    {
      href: '/portal/club',
      title: 'Datos del club',
      text: 'Perfil, contacto y tarifas.',
      icon: TrendingUp,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <header className="synq-card relative overflow-hidden p-8 md:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-synq-accent/10 blur-3xl" />
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-synq-accent">
          Panel de control
        </p>
        <h1 className="mt-3 font-serif-display text-3xl text-white md:text-4xl">
          Bienvenido, {ctx.club.name}
        </h1>
        <p className="mt-3 max-w-2xl text-synq-muted leading-relaxed">
          Gestiona cantera, metodología y configuración del club desde un solo lugar.
          Los módulos de patrocinadores y torneos llegarán en la siguiente fase.
        </p>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(({ label, value, hint, icon: Icon, accent }) => (
          <article
            key={label}
            className={`synq-card-hover relative overflow-hidden bg-gradient-to-br ${accent} p-5`}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm text-synq-muted">{label}</p>
              <div className="rounded-lg bg-white/[0.06] p-2">
                <Icon className="h-4 w-4 text-synq-accent" />
              </div>
            </div>
            <p className="mt-4 text-2xl font-semibold tracking-tight text-white">{value}</p>
            <p className="mt-1 text-xs text-synq-muted">{hint}</p>
          </article>
        ))}
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-white">Accesos rápidos</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {quickLinks.map(({ href, title, text, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="synq-card-hover group flex flex-col p-5"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-synq-pitch/15 p-2.5 transition-colors group-hover:bg-synq-pitch/25">
                  <Icon className="h-5 w-5 text-synq-accent" />
                </div>
                <h3 className="font-semibold text-white">{title}</h3>
              </div>
              <p className="mt-3 flex-1 text-sm text-synq-muted leading-relaxed">{text}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-synq-accent">
                Abrir
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
