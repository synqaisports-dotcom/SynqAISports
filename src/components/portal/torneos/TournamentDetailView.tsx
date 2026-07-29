import Link from 'next/link';
import { TournamentConfigPanel } from '@/components/portal/torneos/TournamentConfigPanel';
import { TournamentCrucesPanel } from '@/components/portal/torneos/TournamentCrucesPanel';
import { TournamentDetailActions } from '@/components/portal/torneos/TournamentDetailActions';
import { TournamentEquiposPanel } from '@/components/portal/torneos/TournamentEquiposPanel';
import { TournamentOperativaGuide } from '@/components/portal/torneos/TournamentOperativaGuide';
import { TournamentSchedulePanel } from '@/components/portal/torneos/TournamentSchedulePanel';
import { TournamentSignagePreview } from '@/components/portal/torneos/TournamentSignagePreview';
import { TournamentSponsorsPanel } from '@/components/portal/torneos/TournamentSponsorsPanel';
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
  CalendarClock,
  ExternalLink,
  GitBranch,
  Globe,
  Layers,
  MapPin,
  Megaphone,
  Settings,
  Ticket,
  Trophy,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const TOURNAMENT_TABS = [
  { id: 'resumen', label: 'Resumen', icon: Trophy },
  { id: 'configuracion', label: 'Configuración', icon: Settings },
  { id: 'equipos', label: 'Equipos', icon: Users },
  { id: 'horarios', label: 'Horarios', icon: CalendarClock },
  { id: 'cruces', label: 'Cruces', icon: GitBranch },
  { id: 'patrocinadores', label: 'Patrocinadores', icon: Megaphone },
  { id: 'ticketing', label: 'Ticketing', icon: Ticket },
  { id: 'ingresos', label: 'Ingresos', icon: Layers },
  { id: 'signage', label: 'Signage', icon: Globe },
] as const;

export type TournamentTabId = (typeof TOURNAMENT_TABS)[number]['id'];

type Props = {
  bundle: TournamentBundle;
  tournamentId: string;
  tab: TournamentTabId;
};

export function TournamentDetailView({ bundle, tournamentId, tab }: Props) {
  const { tournament } = bundle;
  const confirmedTeams = bundle.teams.filter((t) => t.status === 'confirmed').length;
  const liveMatches = bundle.matches.filter((m) => m.status === 'live').length;
  const revenue = totalEstimatedRevenueCents(tournament.revenue_estimates_json);

  return (
    <div className="space-y-4">
      <div className="portal-section-surface rounded-xl p-4 md:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold md:text-2xl">{tournament.name}</h1>
              <Badge variant="outline">{TOURNAMENT_STATUS_LABELS[tournament.status]}</Badge>
              {tournament.public_enabled ? (
                <Badge className="border-cyan-400/30 bg-cyan-400/10 text-cyan-300">Público</Badge>
              ) : null}
              {liveMatches > 0 ? (
                <Badge className="border-cyan-400/30 bg-cyan-400/10 text-cyan-300">{liveMatches} en vivo</Badge>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {TOURNAMENT_SPORT_LABELS[tournament.sport_key]}
              {tournament.venue_name ? ` · ${tournament.venue_name}` : ''}
              {tournament.starts_at
                ? ` · ${new Date(tournament.starts_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`
                : ''}
            </p>
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
                Hub PWA
              </Link>
            </Button>
            <TournamentDetailActions tournamentId={tournament.id} publicEnabled={tournament.public_enabled} />
          </div>
        </div>

        <nav className="mt-4 flex gap-1 overflow-x-auto border-t border-border/50 pt-4 pb-1" aria-label="Secciones del torneo">
          {TOURNAMENT_TABS.map(({ id, label, icon: Icon }) => (
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
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="grid gap-3 sm:grid-cols-3 lg:col-span-2 lg:grid-cols-4">
            <Stat label="Categorías" value={String(bundle.categories.length)} />
            <Stat label="Equipos confirmados" value={String(confirmedTeams)} highlight />
            <Stat label="Partidos" value={String(bundle.matches.length)} />
            <Stat label="Campos" value={String(bundle.fields.length)} />
          </div>
          <div className="lg:col-span-2">
            <TournamentOperativaGuide />
          </div>
          <div className="portal-section-surface rounded-xl p-4">
            <h3 className="flex items-center gap-2 font-medium">
              <MapPin className="size-4 text-primary" />
              Accesos rápidos
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline">
                <Link href={`/portal/torneos/${tournamentId}?tab=configuracion`}>Configurar torneo</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href={`/portal/torneos/${tournamentId}?tab=horarios`}>Ver horarios</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href={`/portal/torneos/${tournamentId}?tab=cruces`}>Ver cruces</Link>
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {tab === 'configuracion' ? <TournamentConfigPanel bundle={bundle} /> : null}
      {tab === 'equipos' ? <TournamentEquiposPanel bundle={bundle} /> : null}
      {tab === 'horarios' ? <TournamentSchedulePanel bundle={bundle} /> : null}
      {tab === 'cruces' ? <TournamentCrucesPanel bundle={bundle} /> : null}
      {tab === 'patrocinadores' ? <TournamentSponsorsPanel bundle={bundle} /> : null}

      {tab === 'ticketing' ? (
        <div className="portal-section-surface space-y-4 rounded-xl p-4">
          <h3 className="font-medium">Tipos de entrada</h3>
          {bundle.ticketTypes.map((tt) => (
            <div key={tt.id} className="flex justify-between border-b border-border/30 py-2 text-sm last:border-0">
              <div>
                <p className="font-medium">{tt.name}</p>
                {tt.description ? <p className="text-xs text-muted-foreground">{tt.description}</p> : null}
              </div>
              <span className="tabular-nums font-semibold text-primary">{(tt.price_cents / 100).toFixed(2)} €</span>
            </div>
          ))}
          <TournamentDetailActions tournamentId={tournament.id} mode="gate" />
        </div>
      ) : null}

      {tab === 'ingresos' ? (
        <div className="portal-section-surface space-y-4 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Estimación de ingresos del evento</h3>
            <TournamentDetailActions tournamentId={tournament.id} mode="revenue" />
          </div>
          <p className="text-3xl font-semibold tabular-nums text-cyan-300">
            {(revenue / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
          </p>
          <div className="grid gap-3 text-sm md:grid-cols-3">
            <div className="rounded-lg border border-border/50 p-3">
              <p className="text-muted-foreground">Ticketing</p>
              <p className="mt-1 font-medium">
                {tournament.revenue_estimates_json.ticketing?.projected_attendance ?? 0} ×{' '}
                {((tournament.revenue_estimates_json.ticketing?.avg_ticket_cents ?? 0) / 100).toFixed(2)} €
              </p>
            </div>
            <div className="rounded-lg border border-border/50 p-3">
              <p className="text-muted-foreground">Patrocinio</p>
              <p className="mt-1 font-medium">
                {tournament.revenue_estimates_json.sponsorship?.gold_slots ?? 0} oro ·{' '}
                {tournament.revenue_estimates_json.sponsorship?.silver_slots ?? 0} plata
              </p>
            </div>
            <div className="rounded-lg border border-border/50 p-3">
              <p className="text-muted-foreground">Signage</p>
              <p className="mt-1 font-medium">
                {tournament.revenue_estimates_json.signage?.impressions_per_day ?? 0} imp/día
              </p>
            </div>
          </div>
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
        'inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors',
        active ? 'bg-primary/15 text-primary shadow-sm' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
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

export function parseTournamentTab(value: string | undefined): TournamentTabId {
  const ids = TOURNAMENT_TABS.map((t) => t.id);
  if (value && ids.includes(value as TournamentTabId)) return value as TournamentTabId;
  return 'resumen';
}
