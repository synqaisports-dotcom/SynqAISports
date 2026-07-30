'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { addTournamentCategory, inviteTeam, updateTeamStatus } from '@/app/actions/tournaments';
import { delegateUrl } from '@/lib/tournament-urls';
import {
  TEAM_STATUS_LABELS,
  type TournamentBundle,
  type TournamentTeam,
} from '@/lib/tournaments';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, Copy, ExternalLink, Mail, UserCheck } from 'lucide-react';

function teamsByGroup(teams: TournamentTeam[]): Map<string, TournamentTeam[]> {
  const map = new Map<string, TournamentTeam[]>();
  for (const team of teams) {
    const code = team.group_code ?? 'Sin grupo';
    const list = map.get(code) ?? [];
    list.push(team);
    map.set(code, list);
  }
  return new Map([...map.entries()].sort(([a], [b]) => a.localeCompare(b)));
}

function TeamRow({ team }: { team: TournamentTeam }) {
  const [pending, startTransition] = useTransition();
  const delegateLink = team.invite_token ? delegateUrl(team.invite_token) : null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/40 bg-background/20 px-3 py-2 text-sm">
      <div className="min-w-0">
        <p className="font-medium">{team.name}</p>
        <p className="text-xs text-muted-foreground">
          {team.external_club_name ?? '—'}
          {team.contact_name ? ` · ${team.contact_name}` : ''}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge
          variant="outline"
          className={
            team.status === 'confirmed'
              ? 'border-emerald-400/40 text-emerald-300'
              : team.status === 'invited'
                ? 'border-amber-400/40 text-amber-300'
                : ''
          }
        >
          {TEAM_STATUS_LABELS[team.status]}
        </Badge>
        {delegateLink ? (
          <>
            <button
              type="button"
              title="Copiar enlace delegado"
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-cyan-300"
              onClick={() => navigator.clipboard.writeText(`${window.location.origin}${delegateLink}`)}
            >
              <Copy className="size-4" />
            </button>
            <Link
              href={delegateLink}
              target="_blank"
              title="Abrir portal delegado"
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-cyan-300"
            >
              <ExternalLink className="size-4" />
            </Link>
          </>
        ) : null}
        {team.status !== 'confirmed' ? (
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-2 text-xs"
            disabled={pending}
            onClick={() => {
              startTransition(async () => {
                await updateTeamStatus(team.id, 'confirmed');
              });
            }}
          >
            <UserCheck className="mr-1 size-3.5" />
            Confirmar
          </Button>
        ) : (
          <span className="text-cyan-300" title="Confirmado">
            <Check className="size-4" />
          </span>
        )}
      </div>
    </div>
  );
}

export function TournamentEquiposPanel({ bundle }: { bundle: TournamentBundle }) {
  const [pending, startTransition] = useTransition();

  const stats = useMemo(() => {
    const confirmed = bundle.teams.filter((t) => t.status === 'confirmed').length;
    return { total: bundle.teams.length, confirmed };
  }, [bundle.teams]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="portal-section-surface rounded-xl px-4 py-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Equipos</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{stats.total}</p>
        </div>
        <div className="portal-section-surface rounded-xl px-4 py-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Confirmados</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-cyan-300">{stats.confirmed}</p>
        </div>
      </div>

      {bundle.categories.map((cat) => {
        const catTeams = bundle.teams.filter((t) => t.category_id === cat.id);
        const byGroup = teamsByGroup(catTeams);

        return (
          <div key={cat.id} className="portal-section-surface rounded-xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-medium">{cat.name}</h3>
              <AddTeamForm tournamentId={bundle.tournament.id} categoryId={cat.id} />
            </div>

            <div className="mt-4 space-y-4">
              {[...byGroup.entries()].map(([groupCode, teams]) => (
                <div key={groupCode}>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-cyan-300/90">
                    Grupo {groupCode}
                    <span className="ml-2 text-muted-foreground">
                      ({teams.filter((t) => t.status === 'confirmed').length}/{teams.length} confirmados)
                    </span>
                  </p>
                  <div className="space-y-2">
                    {teams.map((team) => (
                      <TeamRow key={team.id} team={team} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <AddCategoryForm tournamentId={bundle.tournament.id} pending={pending} startTransition={startTransition} />
    </div>
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
      <Input name="name" placeholder="Nombre equipo" required className="portal-field-surface h-8 text-xs" />
      <Input name="contact_email" type="email" placeholder="Email delegado" className="portal-field-surface h-8 text-xs" />
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        <Mail className="mr-1 size-3.5" />
        Invitar
      </Button>
    </form>
  );
}

function AddCategoryForm({
  tournamentId,
  pending,
  startTransition,
}: {
  tournamentId: string;
  pending: boolean;
  startTransition: (fn: () => void) => void;
}) {
  return (
    <form
      className="flex flex-wrap gap-2 rounded-xl border border-dashed border-primary/30 p-4"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
          await addTournamentCategory(tournamentId, fd);
          e.currentTarget.reset();
        });
      }}
    >
      <Input name="name" placeholder="Nueva categoría" className="portal-field-surface" />
      <input type="hidden" name="groups_count" value={4} />
      <input type="hidden" name="teams_per_group" value={4} />
      <input type="hidden" name="format_type" value="groups_multifinal" />
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        Añadir categoría
      </Button>
    </form>
  );
}
