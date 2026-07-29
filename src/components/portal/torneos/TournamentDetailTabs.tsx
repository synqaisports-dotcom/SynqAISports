'use client';

import { useState, useTransition } from 'react';
import {
  addTournamentCategory,
  getGateAccessUrl,
  inviteTeam,
  refreshRevenueEstimates,
  toggleTournamentPublic,
} from '@/app/actions/tournaments';
import { TournamentBracketsPanel } from '@/components/portal/torneos/TournamentBracketsPanel';
import { TournamentSignagePreview } from '@/components/portal/torneos/TournamentSignagePreview';
import { publicTournamentUrl } from '@/lib/tournament-access';
import {
  TEAM_STATUS_LABELS,
  TOURNAMENT_SPORT_LABELS,
  TOURNAMENT_STATUS_LABELS,
  totalEstimatedRevenueCents,
  type TournamentBundle,
} from '@/lib/tournaments';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  Copy,
  ExternalLink,
  Globe,
  Layers,
  MapPin,
  Megaphone,
  Ticket,
  Trophy,
  Users,
} from 'lucide-react';

const TABS = [
  { id: 'resumen', label: 'Resumen', icon: Trophy },
  { id: 'equipos', label: 'Equipos', icon: Users },
  { id: 'competicion', label: 'Competición', icon: Layers },
  { id: 'ticketing', label: 'Ticketing', icon: Ticket },
  { id: 'ingresos', label: 'Ingresos', icon: Megaphone },
  { id: 'signage', label: 'Signage', icon: Globe },
] as const;

type TabId = (typeof TABS)[number]['id'];

export function TournamentDetailTabs({ bundle }: { bundle: TournamentBundle }) {
  const [tab, setTab] = useState<TabId>('resumen');
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const { tournament } = bundle;

  const confirmedTeams = bundle.teams.filter((t) => t.status === 'confirmed').length;
  const revenue = totalEstimatedRevenueCents(tournament.revenue_estimates_json);

  function handleTogglePublic() {
    startTransition(async () => {
      const res = await toggleTournamentPublic(tournament.id, !tournament.public_enabled);
      setMessage(res.message ?? (res.ok ? 'Actualizado' : 'Error'));
    });
  }

  function handleRefreshRevenue() {
    startTransition(async () => {
      const res = await refreshRevenueEstimates(tournament.id);
      setMessage(res.message ?? null);
    });
  }

  return (
    <div className="space-y-4">
      <div className="portal-section-surface rounded-xl p-4 md:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold">{tournament.name}</h1>
              <Badge variant="outline">{TOURNAMENT_STATUS_LABELS[tournament.status]}</Badge>
              {tournament.public_enabled ? (
                <Badge className="border-cyan-400/30 bg-cyan-400/10 text-cyan-300">Público</Badge>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {TOURNAMENT_SPORT_LABELS[tournament.sport_key]}
              {tournament.venue_name ? ` · ${tournament.venue_name}` : ''}
            </p>
            {tournament.description ? (
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{tournament.description}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {tournament.public_enabled ? (
              <Button asChild size="sm" variant="outline">
                <Link href={publicTournamentUrl(tournament.slug)} target="_blank">
                  <ExternalLink className="mr-1.5 size-4" />
                  Web pública
                </Link>
              </Button>
            ) : null}
            <Button size="sm" variant="outline" onClick={handleTogglePublic} disabled={pending}>
              <Globe className="mr-1.5 size-4" />
              {tournament.public_enabled ? 'Ocultar web' : 'Publicar web'}
            </Button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 border-t border-border/50 pt-4">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors',
                tab === id
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              )}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {message ? <p className="text-sm text-cyan-300">{message}</p> : null}

      {tab === 'resumen' ? (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="portal-section-surface rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Categorías</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-primary">{bundle.categories.length}</p>
          </div>
          <div className="portal-section-surface rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Equipos confirmados</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-cyan-300">{confirmedTeams}</p>
          </div>
          <div className="portal-section-surface rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Partidos</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-primary">{bundle.matches.length}</p>
          </div>

          <div className="portal-section-surface rounded-xl p-4 md:col-span-2">
            <h3 className="flex items-center gap-2 font-medium">
              <MapPin className="size-4 text-primary" />
              Campos
            </h3>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              {bundle.fields.length === 0 ? (
                <li>Sin campos configurados</li>
              ) : (
                bundle.fields.map((f) => <li key={f.id}>{f.label}</li>)
              )}
            </ul>
          </div>

          <div className="portal-section-surface rounded-xl p-4">
            <h3 className="font-medium">Patrocinadores</h3>
            <ul className="mt-2 space-y-1 text-sm">
              {bundle.sponsors.filter((s) => s.active).map((s) => (
                <li key={s.id}>
                  {s.name}{' '}
                  <span className="text-xs text-muted-foreground">({s.tier})</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      {tab === 'equipos' ? (
        <div className="space-y-4">
          {bundle.categories.map((cat) => (
            <div key={cat.id} className="portal-section-surface rounded-xl p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-medium">{cat.name}</h3>
                <AddTeamForm tournamentId={tournament.id} categoryId={cat.id} />
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
                        {team.invite_token ? (
                          <CopyInviteLink token={team.invite_token} />
                        ) : null}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}

          <AddCategoryForm tournamentId={tournament.id} />
        </div>
      ) : null}

      {tab === 'competicion' ? <TournamentBracketsPanel bundle={bundle} /> : null}

      {tab === 'ticketing' ? (
        <div className="portal-section-surface space-y-3 rounded-xl p-4">
          <h3 className="font-medium">Tipos de entrada</h3>
          {bundle.ticketTypes.map((tt) => (
            <div key={tt.id} className="flex justify-between text-sm">
              <span>{tt.name}</span>
              <span className="tabular-nums text-primary">{(tt.price_cents / 100).toFixed(2)} €</span>
            </div>
          ))}
          <GateLinkButton tournamentId={tournament.id} />
        </div>
      ) : null}

      {tab === 'ingresos' ? (
        <div className="portal-section-surface space-y-4 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Estimación de ingresos</h3>
            <Button size="sm" variant="outline" onClick={handleRefreshRevenue} disabled={pending}>
              Recalcular
            </Button>
          </div>
          <p className="text-3xl font-semibold tabular-nums text-cyan-300">
            {(revenue / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
          </p>
          <div className="grid gap-3 text-sm md:grid-cols-3">
            <div>
              <p className="text-muted-foreground">Ticketing</p>
              <p className="font-medium">
                {tournament.revenue_estimates_json.ticketing?.projected_attendance ?? 0} entradas ×{' '}
                {((tournament.revenue_estimates_json.ticketing?.avg_ticket_cents ?? 0) / 100).toFixed(2)} €
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Patrocinio</p>
              <p className="font-medium">
                {tournament.revenue_estimates_json.sponsorship?.gold_slots ?? 0} oro ·{' '}
                {tournament.revenue_estimates_json.sponsorship?.silver_slots ?? 0} plata
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Signage</p>
              <p className="font-medium">
                {tournament.revenue_estimates_json.signage?.impressions_per_day ?? 0} impresiones/día
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {tab === 'signage' ? <TournamentSignagePreview bundle={bundle} /> : null}
    </div>
  );
}

function CopyInviteLink({ token }: { token: string }) {
  const url = typeof window !== 'undefined' ? `${window.location.origin}/torneo/equipo/${token}` : `/torneo/equipo/${token}`;

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
        <input
          name="name"
          placeholder="Sub-10"
          required
          className="rounded-lg border border-border bg-background/50 px-3 py-2 text-sm"
        />
        <input
          name="groups_count"
          type="number"
          min={1}
          max={16}
          defaultValue={6}
          placeholder="Grupos"
          className="rounded-lg border border-border bg-background/50 px-3 py-2 text-sm"
        />
        <input
          name="teams_per_group"
          type="number"
          min={2}
          max={8}
          defaultValue={4}
          placeholder="Equipos/grupo"
          className="rounded-lg border border-border bg-background/50 px-3 py-2 text-sm"
        />
        <Button type="submit" size="sm" disabled={pending}>
          Añadir
        </Button>
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
      <input
        name="name"
        placeholder="Equipo"
        required
        className="rounded-lg border border-border bg-background/50 px-2 py-1 text-xs"
      />
      <input
        name="group_code"
        placeholder="Grupo"
        maxLength={1}
        className="w-14 rounded-lg border border-border bg-background/50 px-2 py-1 text-xs uppercase"
      />
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        Invitar
      </Button>
    </form>
  );
}

function GateLinkButton({ tournamentId }: { tournamentId: string }) {
  const [url, setUrl] = useState<string | null>(null);

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={async () => {
        const u = await getGateAccessUrl(tournamentId);
        setUrl(u);
        if (u) navigator.clipboard.writeText(`${window.location.origin}${u}`);
      }}
    >
      {url ? 'Enlace taquilla copiado' : 'Obtener enlace taquilla'}
    </Button>
  );
}
