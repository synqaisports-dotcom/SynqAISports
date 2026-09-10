'use client';

import { useMemo, useState, useTransition } from 'react';
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
import { refreshRevenueEstimates, updateTournamentRevenueEstimates } from '@/app/actions/tournaments';
import { TournamentChartTooltip } from '@/components/portal/torneos/TournamentChartTooltip';
import { PORTAL_FIELD_LABEL_CLASS } from '@/lib/portal-form-styles';
import { SYNQ_CHART_CURSOR } from '@/components/portal/SynqChartPrimitives';
import { sumActiveSponsorCents } from '@/lib/tournament-sponsors';
import {
  revenueBreakdownCents,
  totalEstimatedRevenueCents,
  type TournamentBundle,
} from '@/lib/tournaments';
import { SynqNumericStepper } from '@/components/portal/SynqNumericStepper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Layers, Loader2, RefreshCw } from 'lucide-react';

const CHART_COLORS = ['#22d3ee', '#a78bfa', '#fbbf24', '#34d399'];

type Props = {
  bundle: TournamentBundle;
};

function euro(value: number) {
  return value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
}

export function TournamentRevenuePanel({ bundle }: Props) {
  const { tournament } = bundle;
  const est = tournament.revenue_estimates_json;
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const sponsorTotalCents = sumActiveSponsorCents(bundle.sponsors);

  const [spectatorsCount, setSpectatorsCount] = useState(
    est.spectators?.count ?? est.ticketing?.projected_attendance ?? 0
  );
  const [spectatorsUnit, setSpectatorsUnit] = useState(
    (est.spectators?.unit_cents ?? est.ticketing?.avg_ticket_cents ?? 500) / 100
  );
  const [bonosCount, setBonosCount] = useState(est.bonos?.count ?? 0);
  const [bonosUnit, setBonosUnit] = useState((est.bonos?.unit_cents ?? 1500) / 100);

  const previewEstimates = useMemo(
    () => ({
      spectators: { count: spectatorsCount, unit_cents: Math.round(spectatorsUnit * 100) },
      bonos: { count: bonosCount, unit_cents: Math.round(bonosUnit * 100) },
      sponsorship: { total_cents: sponsorTotalCents },
      signage: est.signage,
    }),
    [spectatorsCount, spectatorsUnit, bonosCount, bonosUnit, sponsorTotalCents, est.signage]
  );

  const breakdown = revenueBreakdownCents(previewEstimates);
  const total = totalEstimatedRevenueCents(previewEstimates);

  const chartData = [
    { key: 'spectators', name: 'Taquilla', value: breakdown.spectators / 100, fill: CHART_COLORS[0] },
    { key: 'bonos', name: 'Bonos', value: breakdown.bonos / 100, fill: CHART_COLORS[1] },
    { key: 'sponsorship', name: 'Patrocinio', value: breakdown.sponsorship / 100, fill: CHART_COLORS[2] },
    { key: 'signage', name: 'Signage', value: breakdown.signage / 100, fill: CHART_COLORS[3] },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-5">
      <div className="portal-section-surface rounded-xl p-4 md:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 font-medium">
              <Layers className="size-4 text-cyan-300" />
              Estimación de ingresos del evento
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Taquilla y bonos los defines aquí. El patrocinio se suma automáticamente desde las fichas de la pestaña Patrocinadores.
            </p>
          </div>
          <p className="text-3xl font-semibold tabular-nums text-cyan-300">{euro(total / 100)}</p>
        </div>

        {message ? <p className="mt-3 text-sm text-cyan-200">{message}</p> : null}

        <div className="mt-4 grid gap-2 rounded-lg border border-border/40 bg-background/20 p-3 text-xs sm:grid-cols-2">
          <CalcRow label="Taquilla" value={`${spectatorsCount} × ${euro(spectatorsUnit)} = ${euro(breakdown.spectators / 100)}`} />
          <CalcRow label="Bonos" value={`${bonosCount} × ${euro(bonosUnit)} = ${euro(breakdown.bonos / 100)}`} />
          <CalcRow label="Patrocinio (fichas)" value={euro(breakdown.sponsorship / 100)} />
          <CalcRow label="Signage estimado" value={euro(breakdown.signage / 100)} />
        </div>

        <div className="mt-6 h-56 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(183 100% 50% / 0.12)" />
                <XAxis dataKey="name" tick={{ fill: 'hsl(215 20% 65%)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'hsl(215 20% 65%)', fontSize: 11 }} />
                <Tooltip cursor={SYNQ_CHART_CURSOR} content={<TournamentChartTooltip />} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry) => (
                    <Cell key={entry.key} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Ajusta los valores para ver la gráfica
            </p>
          )}
        </div>
      </div>

      <form
        className="portal-section-surface grid gap-4 rounded-xl p-4 md:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          startTransition(async () => {
            const res = await updateTournamentRevenueEstimates(tournament.id, fd);
            setMessage(res.message ?? (res.ok ? 'Guardado' : 'Error'));
          });
        }}
      >
        <input type="hidden" name="spectators_count" value={spectatorsCount} readOnly />
        <input type="hidden" name="spectators_unit_eur" value={spectatorsUnit} readOnly />
        <input type="hidden" name="bonos_count" value={bonosCount} readOnly />
        <input type="hidden" name="bonos_unit_eur" value={bonosUnit} readOnly />
        <input type="hidden" name="sponsorship_total_eur" value={sponsorTotalCents / 100} readOnly />
        <input type="hidden" name="signage_impressions" value={est.signage?.impressions_per_day ?? 0} readOnly />
        <input type="hidden" name="signage_cpm_eur" value={(est.signage?.cpm_cents ?? 0) / 100} readOnly />

        <div>
          <label className={PORTAL_FIELD_LABEL_CLASS}>Padres / acompañantes en grada (personas)</label>
          <SynqNumericStepper name="sc" value={spectatorsCount} onChange={(v) => setSpectatorsCount(v ?? 0)} min={0} max={99999} />
          <p className="mt-1 text-[11px] text-muted-foreground">Número de personas, no euros.</p>
        </div>
        <div>
          <label className={PORTAL_FIELD_LABEL_CLASS}>Precio medio entrada (€)</label>
          <Input
            type="number"
            step="0.5"
            min={0}
            value={spectatorsUnit}
            onChange={(e) => setSpectatorsUnit(Number(e.target.value) || 0)}
            className="portal-field-surface"
          />
          <p className="mt-1 text-[11px] text-muted-foreground">
            Ej.: 600 personas × 5 € = {euro(spectatorsCount * spectatorsUnit)}
          </p>
        </div>
        <div>
          <label className={PORTAL_FIELD_LABEL_CLASS}>Bonos / abonos vendidos (unidades)</label>
          <SynqNumericStepper name="bc" value={bonosCount} onChange={(v) => setBonosCount(v ?? 0)} min={0} max={9999} />
        </div>
        <div>
          <label className={PORTAL_FIELD_LABEL_CLASS}>Precio medio bono (€)</label>
          <Input
            type="number"
            step="0.5"
            min={0}
            value={bonosUnit}
            onChange={(e) => setBonosUnit(Number(e.target.value) || 0)}
            className="portal-field-surface"
          />
          <p className="mt-1 text-[11px] text-muted-foreground">
            Ej.: 40 bonos × 15 € = {euro(bonosCount * bonosUnit)}
          </p>
        </div>
        <div className="md:col-span-2 rounded-lg border border-cyan-400/20 bg-cyan-400/5 p-3">
          <p className={PORTAL_FIELD_LABEL_CLASS}>Patrocinio (suma automática)</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-cyan-300">{euro(sponsorTotalCents / 100)}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Suma de las fichas activas en Patrocinadores ({bundle.sponsors.filter((s) => s.active).length} patrocinadores).
            Edita cada ficha para cambiar su importe.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 md:col-span-2">
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            Guardar estimación
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => {
              startTransition(async () => {
                const res = await refreshRevenueEstimates(tournament.id);
                setMessage(res.message ?? null);
              });
            }}
          >
            <RefreshCw className="mr-1.5 size-4" />
            Recalcular signage y taquilla
          </Button>
        </div>
      </form>
    </div>
  );
}

function CalcRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums text-foreground">{value}</span>
    </div>
  );
}
