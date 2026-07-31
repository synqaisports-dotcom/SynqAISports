'use client';

import Link from 'next/link';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { TournamentChartTooltip } from '@/components/portal/torneos/TournamentChartTooltip';
import {
  buildTournamentOperationsChart,
  buildTournamentPlayersChart,
  buildTournamentProjectionChart,
  buildTournamentRevenueBreakdownChart,
  buildTournamentSummaryMetrics,
} from '@/lib/tournament-summary';
import type { TournamentBundle } from '@/lib/tournaments';
import { SYNQ_CHART_CURSOR } from '@/components/portal/SynqChartPrimitives';
import { Button } from '@/components/ui/button';
import { BarChart3, Users } from 'lucide-react';

type Props = {
  bundle: TournamentBundle;
  tournamentId: string;
};

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="portal-section-surface rounded-xl p-4">
      <p className="text-sm font-medium">{title}</p>
      {subtitle ? <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p> : null}
      <div className="mt-4 h-52 w-full">{children}</div>
    </div>
  );
}

function euroFormatter(value: number) {
  return value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
}

export function TournamentSummaryPanel({ bundle, tournamentId }: Props) {
  const metrics = buildTournamentSummaryMetrics(bundle);
  const operationsChart = buildTournamentOperationsChart(metrics);
  const playersChart = buildTournamentPlayersChart(metrics);
  const projectionChart = buildTournamentProjectionChart(metrics);
  const revenueChart = buildTournamentRevenueBreakdownChart(bundle);
  const teamsWithLogo = bundle.teams.filter((t) => t.logo_url).length;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Operativa del torneo" subtitle="Equipos, confirmaciones y partidos">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={operationsChart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(183 100% 50% / 0.12)" />
              <XAxis dataKey="name" tick={{ fill: 'hsl(215 20% 65%)', fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fill: 'hsl(215 20% 65%)', fontSize: 11 }} />
              <Tooltip cursor={SYNQ_CHART_CURSOR} content={<TournamentChartTooltip />} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {operationsChart.map((entry) => (
                  <Cell key={entry.key} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Público y taquilla" subtitle="Padres/acompañantes estimados e ingreso por entradas">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={projectionChart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(183 100% 50% / 0.12)" />
              <XAxis dataKey="name" tick={{ fill: 'hsl(215 20% 65%)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'hsl(215 20% 65%)', fontSize: 11 }} />
              <Tooltip cursor={SYNQ_CHART_CURSOR} content={<TournamentChartTooltip />} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {projectionChart.map((entry) => (
                  <Cell key={entry.key} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="Jugadores del torneo" subtitle="Plantillas registradas, confirmadas y pendientes">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={playersChart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(183 100% 50% / 0.12)" />
              <XAxis dataKey="name" tick={{ fill: 'hsl(215 20% 65%)', fontSize: 10 }} />
              <YAxis allowDecimals={false} tick={{ fill: 'hsl(215 20% 65%)', fontSize: 11 }} />
              <Tooltip cursor={SYNQ_CHART_CURSOR} content={<TournamentChartTooltip />} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {playersChart.map((entry) => (
                  <Cell key={entry.key} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Desglose de ingresos" subtitle="Por fuente de ingreso estimada (€)">
          {revenueChart.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueChart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(183 100% 50% / 0.12)" />
                <XAxis dataKey="name" tick={{ fill: 'hsl(215 20% 65%)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'hsl(215 20% 65%)', fontSize: 11 }} />
                <Tooltip cursor={SYNQ_CHART_CURSOR} content={<TournamentChartTooltip />} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {revenueChart.map((entry) => (
                    <Cell key={entry.key} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Configura la estimación en la pestaña Ingresos
            </p>
          )}
        </ChartCard>

        <div className="portal-section-surface rounded-xl p-4 lg:col-span-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="flex items-center gap-2 font-medium">
                <Users className="size-4 text-cyan-300" />
                Escudos de equipos
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Los logos configurados se muestran en clasificación y horarios. Sube el escudo de cada equipo en la pestaña Equipos.
              </p>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href={`/portal/torneos/${tournamentId}?tab=equipos`}>Configurar logos</Link>
            </Button>
          </div>
          <div className="mt-4 grid gap-3 grid-cols-2 lg:grid-cols-4">
            <SummaryStat label="Equipos con logo" value={`${teamsWithLogo}/${metrics.totalTeams}`} />
            <SummaryStat label="Jugadores confirmados" value={String(metrics.confirmedPlayers)} />
            <SummaryStat label="Jugadores pendientes" value={String(metrics.pendingPlayers)} />
            <SummaryStat label="Ingresos totales est." value={euroFormatter(metrics.revenueEur)} highlight />
          </div>
          <Button asChild size="sm" variant="ghost" className="mt-3 h-8 text-cyan-300 hover:text-cyan-200">
            <Link href={`/portal/torneos/${tournamentId}?tab=ingresos`}>
              <BarChart3 className="mr-1.5 size-4" />
              Ajustar estimación de ingresos y padres
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function SummaryStat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border/40 bg-background/20 px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-1 text-xl font-semibold tabular-nums ${highlight ? 'text-cyan-300' : ''}`}>{value}</p>
    </div>
  );
}
