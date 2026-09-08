'use client';

import { useEffect, useState } from 'react';
import { getPublicTicketStats } from '@/app/actions/tournaments';
import type { TicketTypeAvailability } from '@/lib/tournament-ticketing';
import { Ticket } from 'lucide-react';

type Props = {
  slug: string;
  compact?: boolean;
};

export function PublicTicketAvailability({ slug, compact = false }: Props) {
  const [items, setItems] = useState<TicketTypeAvailability[] | null>(null);

  useEffect(() => {
    getPublicTicketStats(slug).then(setItems);
  }, [slug]);

  if (!items || items.length === 0) return null;

  return (
    <div className={compact ? 'rounded-xl border border-border/40 bg-white/[0.02] p-3' : 'portal-section-surface rounded-xl p-4'}>
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Ticket className="size-3.5 text-cyan-300" />
        Entradas del torneo
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg border border-white/5 bg-background/20 px-3 py-2">
            <p className="font-medium">{item.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {item.pending} pendientes de validar · {item.used} ya en el recinto
              {item.remaining != null ? ` · ${item.remaining} plazas libres` : ''}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[10px] text-muted-foreground">
        Compra o recoge tu entrada en taquilla del club. SynqAI no procesa pagos en línea.
      </p>
    </div>
  );
}
