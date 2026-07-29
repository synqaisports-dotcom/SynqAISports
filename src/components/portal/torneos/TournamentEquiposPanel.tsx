'use client';

import { useTransition } from 'react';
import { addTournamentCategory, inviteTeam } from '@/app/actions/tournaments';
import { TEAM_STATUS_LABELS, type TournamentBundle } from '@/lib/tournaments';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';

export function TournamentEquiposPanel({ bundle }: { bundle: TournamentBundle }) {
  return (
    <div className="space-y-4">
      {bundle.categories.map((cat) => (
        <div key={cat.id} className="portal-section-surface rounded-xl p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-medium">{cat.name}</h3>
            <AddTeamForm tournamentId={bundle.tournament.id} categoryId={cat.id} />
          </div>
          <div className="mt-3 divide-y divide-border/50">
            {bundle.teams
              .filter((t) => t.category_id === cat.id)
              .map((team) => (
                <div key={team.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                  <div>
                    <p className="font-medium">{team.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {team.external_club_name ?? '—'} · Grupo {team.group_code ?? '?'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{TEAM_STATUS_LABELS[team.status]}</Badge>
                    {team.invite_token ? <CopyInviteLink token={team.invite_token} /> : null}
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
      <AddCategoryForm tournamentId={bundle.tournament.id} />
    </div>
  );
}

function CopyInviteLink({ token }: { token: string }) {
  const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/torneo/equipo/${token}`;
  return (
    <button
      type="button"
      className="text-muted-foreground hover:text-cyan-300"
      title="Copiar enlace delegado"
      onClick={() => navigator.clipboard.writeText(url)}
    >
      <Copy className="size-4" />
    </button>
  );
}

function AddCategoryForm({ tournamentId }: { tournamentId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <form
      className="portal-section-surface rounded-xl p-4"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
          await addTournamentCategory(tournamentId, fd);
          e.currentTarget.reset();
        });
      }}
    >
      <h3 className="font-medium">Añadir categoría</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-4">
        <input name="name" placeholder="Sub-10" required className="rounded-lg border border-border bg-background/50 px-3 py-2 text-sm" />
        <input name="groups_count" type="number" min={1} max={16} defaultValue={6} className="rounded-lg border border-border bg-background/50 px-3 py-2 text-sm" />
        <input name="teams_per_group" type="number" min={2} max={8} defaultValue={4} className="rounded-lg border border-border bg-background/50 px-3 py-2 text-sm" />
        <Button type="submit" size="sm" disabled={pending}>Añadir</Button>
      </div>
    </form>
  );
}

function AddTeamForm({ tournamentId, categoryId }: { tournamentId: string; categoryId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <form
      className="flex flex-wrap gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
          await inviteTeam(tournamentId, categoryId, fd);
          e.currentTarget.reset();
        });
      }}
    >
      <input name="name" placeholder="Equipo" required className="rounded-lg border border-border bg-background/50 px-2 py-1 text-xs" />
      <input name="group_code" placeholder="Grupo" maxLength={1} className="w-14 rounded-lg border border-border bg-background/50 px-2 py-1 text-xs uppercase" />
      <Button type="submit" size="sm" variant="outline" disabled={pending}>Invitar</Button>
    </form>
  );
}
