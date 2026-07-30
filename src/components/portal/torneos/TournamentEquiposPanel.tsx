'use client';

import { useMemo, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { addTournamentCategory, inviteTeam, updateTeamStatus, updateTournamentTeamLogo } from '@/app/actions/tournaments';
import { uploadSignageMedia } from '@/app/actions/signage';
import { analyzeCategoryCapacity } from '@/lib/tournament-category-scheduling';
import { delegateUrl } from '@/lib/tournament-urls';
import { TournamentTeamLogo } from '@/components/portal/torneos/TournamentTeamLogo';
import {
  TEAM_STATUS_LABELS,
  type TournamentBundle,
  type TournamentTeam,
} from '@/lib/tournaments';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, Copy, ExternalLink, ImagePlus, Loader2, Mail, Shield, UserCheck } from 'lucide-react';

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
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const delegateLink = team.invite_token ? delegateUrl(team.invite_token) : null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/40 bg-background/20 px-3 py-2 text-sm">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          title="Subir escudo"
          className="group relative shrink-0"
          disabled={uploading || pending}
          onClick={() => fileRef.current?.click()}
        >
          <TournamentTeamLogo team={team} size="md" />
          <span className="absolute inset-0 flex items-center justify-center rounded-md bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            {uploading ? <Loader2 className="size-4 animate-spin text-white" /> : <ImagePlus className="size-4 text-white" />}
          </span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setUploading(true);
            startTransition(async () => {
              const fd = new FormData();
              fd.set('file', file);
              const uploaded = await uploadSignageMedia(fd);
              if (uploaded.ok && uploaded.url) {
                const logoFd = new FormData();
                logoFd.set('logo_url', uploaded.url);
                await updateTournamentTeamLogo(team.id, logoFd);
              }
              setUploading(false);
              e.target.value = '';
            });
          }}
        />
        <div className="min-w-0">
          <p className="font-medium">{team.name}</p>
          <p className="text-xs text-muted-foreground">
            {team.external_club_name ?? '—'}
            {team.contact_name ? ` · ${team.contact_name}` : ''}
          </p>
        </div>
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
    const withLogo = bundle.teams.filter((t) => t.logo_url).length;
    return { total: bundle.teams.length, confirmed, withLogo };
  }, [bundle.teams]);

  return (
    <div className="space-y-4">
      <div className="portal-section-surface rounded-xl p-4">
        <h3 className="flex items-center gap-2 font-medium">
          <Shield className="size-4 text-cyan-300" />
          Escudos de equipos
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Sube el logo de cada equipo. Se mostrará en clasificación, horarios y cruces del torneo.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          {stats.withLogo}/{stats.total} equipos con escudo configurado
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="portal-section-surface rounded-xl px-4 py-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Equipos</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{stats.total}</p>
        </div>
        <div className="portal-section-surface rounded-xl px-4 py-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Confirmados</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-cyan-300">{stats.confirmed}</p>
        </div>
        <div className="portal-section-surface rounded-xl px-4 py-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Con escudo</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-cyan-300">{stats.withLogo}</p>
        </div>
      </div>

      {bundle.categories.map((cat) => {
        const catTeams = bundle.teams.filter((t) => t.category_id === cat.id);
        const byGroup = teamsByGroup(catTeams);
        const analysis = analyzeCategoryCapacity({
          category: cat,
          tournament: bundle.tournament,
          fields: bundle.fields,
          teamsRegistered: catTeams.length,
        });

        return (
          <div key={cat.id} className="portal-section-surface rounded-xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-medium">{cat.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {analysis.window_label} · {analysis.match_count} partidos · {analysis.teams_registered}/
                  {analysis.team_slots} equipos
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={
                    analysis.fits_structure
                      ? 'border-emerald-400/40 text-emerald-300'
                      : 'border-amber-400/40 text-amber-300'
                  }
                >
                  {analysis.fits_structure ? 'Capacidad OK' : `Faltan ${analysis.overflow_matches} huecos`}
                </Badge>
                <AddTeamForm
                  tournamentId={bundle.tournament.id}
                  categoryId={cat.id}
                  disabled={!analysis.can_invite_more}
                  disabledReason={
                    analysis.invites_remaining <= 0
                      ? 'Plazas agotadas'
                      : !analysis.fits_structure
                        ? 'La categoría no cabe en su ventana horaria'
                        : undefined
                  }
                />
              </div>
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

function AddTeamForm({
  tournamentId,
  categoryId,
  disabled,
  disabledReason,
}: {
  tournamentId: string;
  categoryId: string;
  disabled?: boolean;
  disabledReason?: string;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <form
      className="flex flex-wrap gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (disabled) return;
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
          await inviteTeam(tournamentId, categoryId, fd);
          e.currentTarget.reset();
        });
      }}
    >
      <Input
        name="name"
        placeholder="Nombre equipo"
        required
        disabled={disabled || pending}
        className="portal-field-surface h-8 text-xs"
      />
      <Input
        name="contact_email"
        type="email"
        placeholder="Email delegado"
        disabled={disabled || pending}
        className="portal-field-surface h-8 text-xs"
      />
      <Button type="submit" size="sm" variant="outline" disabled={pending || disabled} title={disabledReason}>
        <Mail className="mr-1 size-3.5" />
        {disabled ? (disabledReason ?? 'No disponible') : 'Invitar'}
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
