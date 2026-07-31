import Link from 'next/link';
import { TournamentClasificacionPanel } from '@/components/portal/torneos/TournamentClasificacionPanel';
import { TournamentConfigPanel } from '@/components/portal/torneos/TournamentConfigPanel';
import { TournamentDossierPanel } from '@/components/portal/torneos/TournamentDossierPanel';
import { TournamentEquiposPanel } from '@/components/portal/torneos/TournamentEquiposPanel';
import { TournamentHeaderActions } from '@/components/portal/torneos/TournamentHeaderActions';
import { TournamentOperativaInfoButton } from '@/components/portal/torneos/TournamentOperativaInfoButton';
import { TournamentRevenuePanel } from '@/components/portal/torneos/TournamentRevenuePanel';
import { TournamentSchedulePanel } from '@/components/portal/torneos/TournamentSchedulePanel';
import { TournamentSignagePreview } from '@/components/portal/torneos/TournamentSignagePreview';
import { TournamentSummaryPanel } from '@/components/portal/torneos/TournamentSummaryPanel';
import { TournamentSponsorsPanel } from '@/components/portal/torneos/TournamentSponsorsPanel';
import {
  TOURNAMENT_SPORT_LABELS,
  TOURNAMENT_STATUS_LABELS,
  type TournamentBundle,
} from '@/lib/tournaments';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  CalendarClock,
  FileText,
  Globe,
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
  { id: 'dossier', label: 'Dossier', icon: FileText },
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
  const liveMatches = bundle.matches.filter((m) => m.status === 'live').length;

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

        <nav className="mt-4 flex flex-wrap gap-1 border-t border-border/50 pt-4 pb-1" aria-label="Secciones del torneo">
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

      {tab === 'resumen' ? <TournamentSummaryPanel bundle={bundle} tournamentId={tournamentId} /> : null}

      {tab === 'ajustes' ? <TournamentConfigPanel bundle={bundle} /> : null}
      {tab === 'equipos' ? <TournamentEquiposPanel bundle={bundle} /> : null}
      {tab === 'horarios' ? <TournamentSchedulePanel bundle={bundle} /> : null}
      {tab === 'clasificacion' ? <TournamentClasificacionPanel bundle={bundle} /> : null}
      {tab === 'patrocinadores' ? <TournamentSponsorsPanel bundle={bundle} /> : null}
      {tab === 'ingresos' ? <TournamentRevenuePanel bundle={bundle} /> : null}
      {tab === 'dossier' ? <TournamentDossierPanel bundle={bundle} tournamentId={tournamentId} /> : null}
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

export function parseTournamentTab(value: string | undefined): TournamentTabId {
  const ids = TOURNAMENT_TABS.map((t) => t.id);
  if (value === 'configuracion') return 'ajustes';
  if (value === 'cruces') return 'clasificacion';
  if (value === 'ticketing') return 'ingresos';
  if (value && ids.includes(value as TournamentTabId)) return value as TournamentTabId;
  return 'resumen';
}
