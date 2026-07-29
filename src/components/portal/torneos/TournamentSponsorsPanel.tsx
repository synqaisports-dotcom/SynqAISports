'use client';

import { useTransition } from 'react';
import { addTournamentSponsor } from '@/app/actions/tournaments';
import type { TournamentBundle } from '@/lib/tournaments';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Megaphone } from 'lucide-react';

const tierLabels = { gold: 'Oro', silver: 'Plata', bronze: 'Bronce' } as const;

export function TournamentSponsorsPanel({ bundle }: { bundle: TournamentBundle }) {
  const [pending, startTransition] = useTransition();
  const sponsors = bundle.sponsors.filter((s) => s.active);

  return (
    <div className="space-y-4">
      <div className="portal-section-surface rounded-xl p-4">
        <h3 className="flex items-center gap-2 font-medium">
          <Megaphone className="size-4 text-primary" />
          Patrocinadores del torneo
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Scoped al evento — aparecen en la web pública y en el signage del torneo.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {sponsors.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin patrocinadores aún.</p>
          ) : (
            sponsors.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2">
                <span className="font-medium">{s.name}</span>
                <Badge variant="outline">{tierLabels[s.tier]}</Badge>
              </div>
            ))
          )}
        </div>
        <form
          className="mt-4 flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            startTransition(async () => {
              await addTournamentSponsor(bundle.tournament.id, fd);
              e.currentTarget.reset();
            });
          }}
        >
          <input name="name" placeholder="Nombre patrocinador" required className="rounded-lg border border-border bg-background/50 px-3 py-2 text-sm" />
          <select name="tier" defaultValue="silver" className="rounded-lg border border-border bg-background/50 px-3 py-2 text-sm">
            <option value="gold">Oro</option>
            <option value="silver">Plata</option>
            <option value="bronze">Bronce</option>
          </select>
          <Button type="submit" size="sm" disabled={pending}>Añadir</Button>
        </form>
      </div>
    </div>
  );
}
