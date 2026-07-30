import { revenueBreakdownCents, totalEstimatedRevenueCents, type TournamentBundle } from '@/lib/tournaments';

export type TournamentSummaryMetrics = {
  totalTeams: number;
  confirmedTeams: number;
  totalMatches: number;
  revenueEur: number;
  parentsEstimate: number;
  spectatorRevenueEur: number;
};

export function buildTournamentSummaryMetrics(bundle: TournamentBundle): TournamentSummaryMetrics {
  const est = bundle.tournament.revenue_estimates_json;
  const breakdown = revenueBreakdownCents(est);
  const parentsEstimate =
    est.spectators?.count ?? est.ticketing?.projected_attendance ?? 0;

  return {
    totalTeams: bundle.teams.length,
    confirmedTeams: bundle.teams.filter((t) => t.status === 'confirmed').length,
    totalMatches: bundle.matches.length,
    revenueEur: totalEstimatedRevenueCents(est) / 100,
    parentsEstimate,
    spectatorRevenueEur: breakdown.spectators / 100,
  };
}

export function buildTournamentOperationsChart(metrics: TournamentSummaryMetrics) {
  return [
    { key: 'teams', name: 'Equipos', value: metrics.totalTeams, fill: '#22d3ee' },
    { key: 'confirmed', name: 'Confirmados', value: metrics.confirmedTeams, fill: '#34d399' },
    { key: 'matches', name: 'Partidos', value: metrics.totalMatches, fill: '#a78bfa' },
  ];
}

export function buildTournamentProjectionChart(metrics: TournamentSummaryMetrics) {
  return [
    { key: 'parents', name: 'Padres / acompañantes', value: metrics.parentsEstimate, fill: '#fbbf24' },
    { key: 'spectatorRevenue', name: 'Taquilla est.', value: metrics.spectatorRevenueEur, fill: '#f472b6' },
  ];
}

export function buildTournamentRevenueBreakdownChart(bundle: TournamentBundle) {
  const breakdown = revenueBreakdownCents(bundle.tournament.revenue_estimates_json);
  return [
    { key: 'spectators', name: 'Público', value: breakdown.spectators / 100, fill: '#22d3ee' },
    { key: 'bonos', name: 'Bonos', value: breakdown.bonos / 100, fill: '#a78bfa' },
    { key: 'sponsorship', name: 'Patrocinio', value: breakdown.sponsorship / 100, fill: '#fbbf24' },
    { key: 'signage', name: 'Signage', value: breakdown.signage / 100, fill: '#34d399' },
  ].filter((d) => d.value > 0);
}
