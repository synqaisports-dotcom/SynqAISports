import Link from 'next/link';
import { TournamentBracketsPanel } from '@/components/portal/torneos/TournamentBracketsPanel';
import { TournamentDetailActions } from '@/components/portal/torneos/TournamentDetailActions';
import { TournamentEquiposPanel } from '@/components/portal/torneos/TournamentEquiposPanel';
import { TournamentSignagePreview } from '@/components/portal/torneos/TournamentSignagePreview';
import { publicTournamentUrl } from '@/lib/tournament-urls';
import {
  TOURNAMENT_SPORT_LABELS,
  TOURNAMENT_STATUS_LABELS,
  totalEstimatedRevenueCents,
  type TournamentBundle,
} from '@/lib/tournaments';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  ExternalLink,
  Globe,
  Layers,
  MapPin,
  Megaphone,
  Ticket,
  Trophy,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const TABS = [
  { id: 'resumen', label: 'Resumen', icon: Trophy },
  { id: 'equipos', label: 'Equipos', icon: Users },
  { id: 'competicion', label: 'Competición', icon: Layers },
  { id: 'ticketing', label: 'Ticketing', icon: Ticket },
  { id: 'ingresos', label: 'Ingresos', icon: Megaphone },
  { id: 'signage', label: 'Signage', icon: Globe },
] as const;

type TabId = (typeof TABS)[number]['id'];

type Props = {
  bundle: TournamentBundle;
  tournamentId: string;
  tab: TabId;
};

export function TournamentDetailView({ bundle, tournamentId, tab }: Props) {
  const { tournament } = bundle;
  const confirmedTeams = bundle.teams.filter((t) => t.status === 'confirmed').length;
  const revenue = totalEstimatedRevenueCents(tournament.revenue_estimates_json);

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
            <Button asChild size="sm" variant="outline">
              <Link href="/torneo/demo" target="_blank">
                Hub PWA demo
              </Link>
            </Button>
            <TournamentDetailActions
              tournamentId={tournament.id}
              publicEnabled={tournament.public_enabled}
            />
          </div>
        </div>

        <nav className="mt-4 flex flex-wrap gap-2 border-t border-border/50 pt-4" aria-label="Secciones">
          {TABS.map(({ id, label, icon: Icon }) => (
            <TabLink
              key={id}
              href={`/portal/torneos/${tournamentId}?tab=${id}`}
              active={tab === id}
              icon={Icon}
              label={label}
            />
          ))}
        </nav>
      </div>

      {tab === 'resumen' ? (
        <div className="grid gap-4 md:grid-cols-3">
          <Stat label="Categorías" value={String(bundle.categories.length)} />
          <Stat label="Equipos confirmados" value={String(confirmedTeams)} highlight />
          <Stat label="Partidos" value={String(bundle.matches.length)} />
          <div className="portal-section-surface rounded-xl p-4 md:col-span-2">
            <h3 className="flex items-center gap-2 font-medium">
              <MapPin className="size-4 text-primary" />
              Campos
            </h3>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              {bundle.fields.length === 0
                ? [<li key="empty">Sin campos configurados</li>]
                : bundle.fields.map((f) => <li key={f.id}>{f.label}</li>)}
            </ul>
          </div>
          <div className="portal-section-surface rounded-xl p-4">
            <h3 className="font-medium">Patrocinadores</h3>
            <ul className="mt-2 space-y-1 text-sm">
              {bundle.sponsors
                .filter((s) => s.active)
                .map((s) => (
                  <li key={s.id}>
                    {s.name} <span className="text-xs text-muted-foreground">({s.tier})</span>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      ) : null}

      {tab === 'equipos' ? <TournamentEquiposPanel bundle={bundle} /> : null}
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
          <TournamentDetailActions tournamentId={tournament.id} mode="gate" />
        </div>
      ) : null}

      {tab === 'ingresos' ? (
        <div className="portal-section-surface space-y-4 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Estimación de ingresos</h3>
            <TournamentDetailActions tournamentId={tournament.id} mode="revenue" />
          </div>
          <p className="text-3xl font-semibold tabular-nums text-cyan-300">
            {(revenue / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
          </p>
        </div>
      ) : null}

      {tab === 'signage' ? <TournamentSignagePreview bundle={bundle} /> : null}
    </div>
  );
}

function TabLink({
  href,
  active,
  icon: Icon,
  label,
}: {
  href: string;
  active: boolean;
  icon: LucideIcon;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors',
        active ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
      )}
    >
      <Icon className="size-4" />
      {label}
    </Link>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="portal-section-surface rounded-xl p-4">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn('mt-1 text-2xl font-semibold tabular-nums', highlight ? 'text-cyan-300' : 'text-primary')}>
        {value}
      </p>
    </div>
  );
}

export function parseTournamentTab(value: string | undefined): TabId {
  const ids = TABS.map((t) => t.id);
  if (value && ids.includes(value as TabId)) return value as TabId;
  return 'resumen';
}
