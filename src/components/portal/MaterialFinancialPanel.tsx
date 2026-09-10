'use client';

import { Wallet } from 'lucide-react';
import {
  formatMaterialMoney,
  totalImmobilizedByCurrency,
  type MaterialCurrency,
  type MaterialZoneValue,
} from '@/lib/club-material';
import { cn } from '@/lib/utils';

type Props = {
  zones: MaterialZoneValue[];
  className?: string;
};

export function MaterialFinancialPanel({ zones, className }: Props) {
  const totals = totalImmobilizedByCurrency(zones);
  const currencies = Object.keys(totals) as MaterialCurrency[];

  if (zones.length === 0 || currencies.length === 0) {
    return (
      <div
        className={cn(
          'portal-section-surface rounded-xl px-4 py-3 text-sm text-muted-foreground',
          className
        )}
      >
        Añade coste por unidad en el catálogo para ver el dinero inmovilizado por zona.
      </div>
    );
  }

  return (
    <div className={cn('portal-section-surface rounded-xl p-4', className)}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Wallet className="size-4 text-primary" />
          <p className="text-sm font-semibold text-foreground">Dinero inmovilizado</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {currencies.map((currency) => (
            <span
              key={currency}
              className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
            >
              Total {formatMaterialMoney(totals[currency] ?? 0, currency)}
            </span>
          ))}
        </div>
      </div>

      <ul className="space-y-2">
        {zones.map((zone) => (
          <li
            key={`${zone.location_type}-${zone.location_id ?? 'club'}`}
            className="flex items-center justify-between gap-3 rounded-lg border border-primary/15 bg-muted/5 px-3 py-2"
          >
            <span className="text-sm text-foreground">{zone.label}</span>
            <div className="flex flex-wrap justify-end gap-2 text-sm font-medium text-primary">
              {(Object.entries(zone.total_by_currency) as Array<[MaterialCurrency, number]>).map(
                ([currency, amount]) => (
                  <span key={currency}>{formatMaterialMoney(amount, currency)}</span>
                )
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
