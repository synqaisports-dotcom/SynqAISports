import { SponsorWallSlide } from '@/components/portal/signage/SponsorWallSlide';
import { TournamentSignageControls } from '@/components/portal/torneos/TournamentSignageControls';
import {
  getTournamentSignageScreenToken,
  isTournamentClubSignageEligible,
  tournamentSignageScreenPath,
  tournamentSponsorsToSignageSponsors,
} from '@/lib/tournament-signage';
import type { TournamentBundle } from '@/lib/tournaments';
import { totalEstimatedRevenueCents } from '@/lib/tournaments';

type Props = {
  bundle: TournamentBundle;
};

/** Vista signage scoped al torneo con estimador de ingresos publicitario. */
export function TournamentSignagePreview({ bundle }: Props) {
  const sponsors = tournamentSponsorsToSignageSponsors(bundle.sponsors);
  const activeSponsors = bundle.sponsors.filter((s) => s.active);

  const revenue = totalEstimatedRevenueCents(bundle.tournament.revenue_estimates_json);
  const signageCents =
    ((bundle.tournament.revenue_estimates_json.signage?.impressions_per_day ?? 0) *
      (bundle.tournament.revenue_estimates_json.signage?.cpm_cents ?? 0)) /
    1000;

  const token = getTournamentSignageScreenToken(bundle.tournament);
  const screenPath = token ? tournamentSignageScreenPath(token) : null;

  return (
    <div className="space-y-4">
      <TournamentSignageControls
        tournamentId={bundle.tournament.id}
        screenPath={screenPath}
        hasClubSignage={isTournamentClubSignageEligible(bundle.tournament)}
        sponsorCount={activeSponsors.length}
      />

      <div className="portal-section-surface overflow-hidden rounded-xl">
        <SponsorWallSlide
          sponsors={sponsors}
          clubName={bundle.tournament.name}
          clubLogoUrl={bundle.tournament.cover_image_url}
          entrance="stagger-fade"
        />
      </div>
      <div className="portal-section-surface rounded-xl p-4 text-sm">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Estimador signage torneo</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums text-cyan-300">
          {(signageCents / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Ingresos totales estimados del evento:{' '}
          {(revenue / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
        </p>
      </div>
    </div>
  );
}
