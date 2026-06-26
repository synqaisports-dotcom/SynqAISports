import { createClient } from '@/lib/supabase/server';
import { countActivePlayers, getStaffContext } from '@/lib/portal';
import { redirect } from 'next/navigation';

export default async function PortalHomePage() {
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const activePlayers = await countActivePlayers(supabase, ctx.club.id);
  const foundingBadge = ctx.club.is_founding
    ? 'Founding — año 1 sin cuota SynqAI'
    : 'Club socio';

  const kpis = [
    {
      label: 'Jugadores activos',
      value: String(activePlayers),
      hint: `${ctx.club.players_count} de referencia`,
      icon: '👥',
    },
    {
      label: 'Cuota familiar',
      value: `${ctx.club.family_fee_annual_eur} €/año`,
      hint: 'Configuración del club',
      icon: '📈',
    },
    {
      label: 'Tarifa SynqAI',
      value: `${ctx.club.synq_rate_per_user_eur} €/user/mes`,
      hint: 'Escala PPP',
      icon: '📱',
    },
    {
      label: 'Estado',
      value: foundingBadge,
      hint: ctx.club.founding_until
        ? `Hasta ${new Date(ctx.club.founding_until).toLocaleDateString('es-ES')}`
        : 'Temporada actual',
      icon: '📅',
    },
  ];

  return (
    <div>
      <h1 className="font-serif-display text-3xl" style={{ color: '#ffffff' }}>
        Inicio
      </h1>
      <p className="mt-2" style={{ color: '#94a3b8' }}>
        Panel de {ctx.club.name}. Métricas ampliadas en fases siguientes.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(({ label, value, hint, icon }) => (
          <article
            key={label}
            className="rounded-2xl border border-white/5 bg-synq-slate/40 p-5"
          >
            <div className="flex items-start justify-between">
              <p className="text-sm text-synq-muted">{label}</p>
              <span className="text-lg" aria-hidden>
                {icon}
              </span>
            </div>
            <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
            <p className="mt-1 text-xs text-synq-muted">{hint}</p>
          </article>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-dashed border-white/10 p-6 text-sm text-synq-muted">
        <p className="font-medium text-white">Próximos módulos</p>
        <ul className="mt-3 list-inside list-disc space-y-1">
          <li>
            <a href="/portal/cantera" className="text-synq-accent hover:underline">
              Cantera
            </a>{' '}
            — equipos y jugadores
          </li>
          <li>
            <a href="/portal/metodologia" className="text-synq-accent hover:underline">
              Metodología
            </a>{' '}
            — ejercicios, microciclos, objetivos
          </li>
          <li>Patrocinadores y digital signage</li>
          <li>Torneos y informes</li>
        </ul>
      </div>
    </div>
  );
}
