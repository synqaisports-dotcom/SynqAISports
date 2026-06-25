'use client';

import { useMemo, useState } from 'react';

function synqRatePerUser(players: number): number {
  if (players >= 600) return 0.5;
  if (players >= 300) return 0.65;
  if (players >= 150) return 0.8;
  return 1.0;
}

export function ClubCalculator() {
  const [players, setPlayers] = useState(190);
  const [familyMonthly, setFamilyMonthly] = useState(1);
  const [adsPerUser, setAdsPerUser] = useState(0.25);

  const stats = useMemo(() => {
    const synqRate = synqRatePerUser(players);
    const familyAnnual = familyMonthly * 12;
    const familyRevenueYear = players * familyAnnual;
    const synqCostMonth = players * synqRate;
    const synqCostYear = synqCostMonth * 12;
    const adsMonth = players * adsPerUser;
    const adsYear = adsMonth * 12;
    const synqPaidFromCashMonth = Math.max(0, synqCostMonth - adsMonth);
    const surplus = Math.max(0, adsMonth - synqCostMonth);
    const clubAdsBonusMonth = surplus * 0.4;
    const clubMarginMonth = players * (familyMonthly - synqRate);
    const clubNetMonth =
      players * familyMonthly - synqPaidFromCashMonth + clubAdsBonusMonth;

    return {
      synqRate,
      familyAnnual,
      familyRevenueYear,
      synqCostMonth,
      synqCostYear,
      adsMonth,
      adsYear,
      clubMarginMonth,
      clubNetMonth,
      clubNetYear: clubNetMonth * 12,
      clubAdsBonusMonth,
    };
  }, [players, familyMonthly, adsPerUser]);

  return (
    <div className="rounded-2xl border border-white/10 bg-synq-slate/40 p-6 md:p-8">
      <div className="grid gap-6 md:grid-cols-3">
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-widest text-synq-muted">
            Jugadores activos
          </span>
          <input
            type="range"
            min={50}
            max={800}
            step={10}
            value={players}
            onChange={(e) => setPlayers(Number(e.target.value))}
            className="mt-2 w-full accent-synq-pitch"
          />
          <span className="mt-1 block font-mono text-2xl font-bold text-white">{players}</span>
        </label>

        <label className="block">
          <span className="text-xs font-medium uppercase tracking-widest text-synq-muted">
            Cuota familiar / mes
          </span>
          <div className="mt-3 flex gap-2">
            {[1, 2].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setFamilyMonthly(v)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                  familyMonthly === v
                    ? 'border-synq-accent bg-synq-pitch/20 text-white'
                    : 'border-white/10 text-synq-muted hover:border-white/20'
                }`}
              >
                {v} € ({v * 12} €/año)
              </button>
            ))}
          </div>
        </label>

        <label className="block">
          <span className="text-xs font-medium uppercase tracking-widest text-synq-muted">
            Ads estimados / usuario / mes
          </span>
          <input
            type="range"
            min={0}
            max={0.8}
            step={0.05}
            value={adsPerUser}
            onChange={(e) => setAdsPerUser(Number(e.target.value))}
            className="mt-2 w-full accent-synq-pitch"
          />
          <span className="mt-1 block font-mono text-lg text-white">
            {adsPerUser.toFixed(2)} €
          </span>
        </label>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: 'SynqAI cobra al club',
            value: `${stats.synqRate.toFixed(2)} €/user/mes`,
            sub: `${stats.synqCostMonth.toFixed(0)} €/mes · ${stats.synqCostYear.toFixed(0)} €/año`,
          },
          {
            label: 'Familias pagan al club',
            value: `${stats.familyAnnual} €/niño/año`,
            sub: `${stats.familyRevenueYear.toLocaleString('es-ES')} €/año total`,
          },
          {
            label: 'Margen club (antes ads)',
            value: `${stats.clubMarginMonth.toFixed(0)} €/mes`,
            sub: `${(stats.clubMarginMonth * 12).toFixed(0)} €/año solo reparto cuota`,
          },
          {
            label: 'Neto club (con ads)',
            value: `${stats.clubNetMonth.toFixed(0)} €/mes`,
            sub: `${stats.clubNetYear.toFixed(0)} €/año · bonus ads ${stats.clubAdsBonusMonth.toFixed(0)} €/mes`,
          },
        ].map(({ label, value, sub }) => (
          <div key={label} className="rounded-xl border border-white/5 bg-black/20 p-4">
            <p className="text-[10px] uppercase tracking-widest text-synq-muted">{label}</p>
            <p className="mt-1 text-xl font-bold text-white">{value}</p>
            <p className="mt-1 text-xs text-synq-muted">{sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
