import Link from 'next/link';
import { TournamentClasificacionPanel } from '@/components/portal/torneos/TournamentClasificacionPanel';
import { TournamentConfigPanel } from '@/components/portal/torneos/TournamentConfigPanel';
import { TournamentEquiposPanel } from '@/components/portal/torneos/TournamentEquiposPanel';
import { TournamentHeaderActions } from '@/components/portal/torneos/TournamentHeaderActions';
import { TournamentOperativaInfoButton } from '@/components/portal/torneos/TournamentOperativaInfoButton';
import { TournamentRevenuePanel } from '@/components/portal/torneos/TournamentRevenuePanel';
import { TournamentSchedulePanel } from '@/components/portal/torneos/TournamentSchedulePanel';
import { TournamentSignagePreview } from '@/components/portal/torneos/TournamentSignagePreview';
import { TournamentSponsorsPanel } from '@/components/portal/torneos/TournamentSponsorsPanel';
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
  BarChart3,
  CalendarClock,
  Globe,
  Layers,
  ListOrdered,
  Megaphone,
  Settings,
  Trophy,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const TOURNAMENT_TABS = [
  { id: 'resumen', label: 'Resumen', icon: Trophy },
  { id: 'ajustes', label: 'Ajustes', icon: Settings },
  { id: 'equipos', label: 'Equipos', icon: Users },
  { id: 'horarios', label: 'Horarios', icon: CalendarClock },
  { id: 'clasificacion', label: 'Clasificación', icon: ListOrdered },
  { id: 'patrocinadores', label: 'Patrocinadores', icon: Megaphone },
  { id: 'ingresos', label: 'Ingresos', icon: BarChart3 },
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
              <TournamentOperativaInfoButton />
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
          <TournamentHeaderActions tournament={tournament} />
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Categorías" value={String(bundle.categories.length)} />
          <Stat label="Equipos confirmados" value={String(confirmedTeams)} highlight />
          <Stat label="Partidos" value={String(bundle.matches.length)} />
          <Stat label="Ingresos est." value={`${(revenue / 100).toFixed(0)} €`} highlight />
          <div className="portal-section-surface rounded-xl p-4 sm:col-span-2 lg:col-span-4">
            <h3 className="flex items-center gap-2 font-medium">
              <Layers className="size-4 text-primary" />
              Accesos rápidos
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline">
                <Link href={`/portal/torneos/${tournamentId}?tab=ajustes`}>Ajustes del torneo</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href={`/portal/torneos/${tournamentId}?tab=horarios`}>Ver horarios</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href={`/portal/torneos/${tournamentId}?tab=clasificacion`}>Clasificación</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href={`/portal/torneos/${tournamentId}?tab=ingresos`}>Estimación ingresos</Link>
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {tab === 'ajustes' ? <TournamentConfigPanel bundle={bundle} /> : null}
      {tab === 'equipos' ? <TournamentEquiposPanel bundle={bundle} /> : null}
      {tab === 'horarios' ? <TournamentSchedulePanel bundle={bundle} /> : null}
      {tab === 'clasificacion' ? <TournamentClasificacionPanel bundle={bundle} /> : null}
      {tab === 'patrocinadores' ? <TournamentSponsorsPanel bundle={bundle} /> : null}
      {tab === 'ingresos' ? <TournamentRevenuePanel bundle={bundle} /> : null}
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
  if (value === 'configuracion') return 'ajustes';
  if (value === 'cruces') return 'clasificacion';
  if (value === 'ticketing') return 'ingresos';
  if (value && ids.includes(value as TournamentTabId)) return value as TournamentTabId;
  return 'resumen';
}
