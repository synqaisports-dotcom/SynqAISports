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
import { PORTAL_FIELD_LABEL_CLASS } from '@/lib/portal-form-styles';
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

export function TournamentRevenuePanel({ bundle }: Props) {
  const { tournament } = bundle;
  const est = tournament.revenue_estimates_json;
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const [spectatorsCount, setSpectatorsCount] = useState(
    est.spectators?.count ?? est.ticketing?.projected_attendance ?? 0
  );
  const [spectatorsUnit, setSpectatorsUnit] = useState(
    (est.spectators?.unit_cents ?? est.ticketing?.avg_ticket_cents ?? 500) / 100
  );
  const [bonosCount, setBonosCount] = useState(est.bonos?.count ?? 0);
  const [bonosUnit, setBonosUnit] = useState((est.bonos?.unit_cents ?? 1500) / 100);
  const [sponsorTotal, setSponsorTotal] = useState(
    (est.sponsorship?.total_cents ?? bundle.sponsors.filter((s) => s.active).reduce((sum, s) => sum + (s.amount_cents ?? 0), 0)) / 100
  );

  const previewEstimates = useMemo(
    () => ({
      spectators: { count: spectatorsCount, unit_cents: Math.round(spectatorsUnit * 100) },
      bonos: { count: bonosCount, unit_cents: Math.round(bonosUnit * 100) },
      sponsorship: { total_cents: Math.round(sponsorTotal * 100) },
      signage: est.signage,
    }),
    [spectatorsCount, spectatorsUnit, bonosCount, bonosUnit, sponsorTotal, est.signage]
  );

  const breakdown = revenueBreakdownCents(previewEstimates);
  const total = totalEstimatedRevenueCents(previewEstimates);

  const chartData = [
    { name: 'Público', value: breakdown.spectators / 100, key: 'spectators' },
    { name: 'Bonos', value: breakdown.bonos / 100, key: 'bonos' },
    { name: 'Patrocinio', value: breakdown.sponsorship / 100, key: 'sponsorship' },
    { name: 'Signage', value: breakdown.signage / 100, key: 'signage' },
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
              Proyección para el organizador. Los ingresos de patrocinio y módulo SynqAI se gestionan vía Admon (costes micro-app), no en la tesorería del club.
            </p>
          </div>
          <p className="text-3xl font-semibold tabular-nums text-cyan-300">
            {total.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
          </p>
        </div>

        {message ? (
          <p className="mt-3 text-sm text-cyan-200">{message}</p>
        ) : null}

        <div className="mt-6 h-56 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(183 100% 50% / 0.12)" />
                <XAxis dataKey="name" tick={{ fill: 'hsl(215 20% 65%)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'hsl(215 20% 65%)', fontSize: 11 }} unit=" €" />
                <Tooltip
                  formatter={(v: number) => [`${v.toFixed(0)} €`, 'Estimado']}
                  contentStyle={{
                    background: 'hsl(210 42% 8%)',
                    border: '1px solid hsl(183 100% 50% / 0.3)',
                    borderRadius: 8,
                  }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={entry.key} fill={CHART_COLORS[index % CHART_COLORS.length]} />
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
        <input type="hidden" name="sponsorship_total_eur" value={sponsorTotal} readOnly />
        <input type="hidden" name="signage_impressions" value={est.signage?.impressions_per_day ?? 0} readOnly />
        <input type="hidden" name="signage_cpm_eur" value={(est.signage?.cpm_cents ?? 0) / 100} readOnly />

        <div>
          <label className={PORTAL_FIELD_LABEL_CLASS}>Acompañantes / público estimado</label>
          <SynqNumericStepper name="sc" value={spectatorsCount} onChange={(v) => setSpectatorsCount(v ?? 0)} min={0} max={99999} />
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
        </div>
        <div>
          <label className={PORTAL_FIELD_LABEL_CLASS}>Bonos / abonos vendidos</label>
          <SynqNumericStepper name="bc" value={bonosCount} onChange={(v) => setBonosCount(v ?? 0)} min={0} max={9999} />
        </div>
        <div>
          <label className={PORTAL_FIELD_LABEL_CLASS}>Importe medio bono (€)</label>
          <Input
            type="number"
            step="0.5"
            min={0}
            value={bonosUnit}
            onChange={(e) => setBonosUnit(Number(e.target.value) || 0)}
            className="portal-field-surface"
          />
        </div>
        <div className="md:col-span-2">
          <label className={PORTAL_FIELD_LABEL_CLASS}>Patrocinio total estimado (€) — SynqAI Admon</label>
          <Input
            type="number"
            step="50"
            min={0}
            value={sponsorTotal}
            onChange={(e) => setSponsorTotal(Number(e.target.value) || 0)}
            className="portal-field-surface"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Suma de fichas de patrocinadores o importe manual. Cubre costes del módulo torneos.
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
            Recalcular desde patrocinadores
          </Button>
        </div>
      </form>
    </div>
  );
}
