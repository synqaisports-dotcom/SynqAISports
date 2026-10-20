import type { TournamentSponsorTier } from '@/lib/tournaments';

export const TOURNAMENT_SPONSOR_TIER_LABELS: Record<TournamentSponsorTier, string> = {
  gold: 'Oro',
  silver: 'Plata',
  bronze: 'Bronce',
};

export type TournamentSponsorTierMeta = {
  label: string;
  color: string;
  suggestedAmountCents: number;
  benefits: string[];
  signage: string;
  webVisibility: string;
};

export const TOURNAMENT_SPONSOR_TIER_META: Record<TournamentSponsorTier, TournamentSponsorTierMeta> = {
  gold: {
    label: 'Oro',
    color: '#ffd700',
    suggestedAmountCents: 150_000,
    benefits: [
      'Logo principal en web y dossier del torneo',
      'Banner en pantallas signage (prioridad máxima)',
      'Mención en apertura y entrega de premios',
      '1 hueco destacado en muro de patrocinadores',
    ],
    signage: 'Rotación prioritaria · mayor tamaño en muro',
    webVisibility: 'Cabecera web pública + ficha destacada',
  },
  silver: {
    label: 'Plata',
    color: '#c0c0c0',
    suggestedAmountCents: 60_000,
    benefits: [
      'Logo en web del torneo y dossier',
      'Presencia en muro de patrocinadores',
      'Mención en comunicaciones del evento',
    ],
    signage: 'Rotación estándar en muro',
    webVisibility: 'Sección patrocinadores en web pública',
  },
  bronze: {
    label: 'Bronce',
    color: '#cd7f32',
    suggestedAmountCents: 25_000,
    benefits: [
      'Logo en listado de patrocinadores',
      'Mención en materiales del torneo',
    ],
    signage: 'Logo en carrusel secundario',
    webVisibility: 'Listado en pie de web pública',
  },
};

export function sponsorAmountCents(sponsor: { amount_cents?: number | null; tier: TournamentSponsorTier }): number {
  if (sponsor.amount_cents != null && sponsor.amount_cents > 0) return sponsor.amount_cents;
  return TOURNAMENT_SPONSOR_TIER_META[sponsor.tier].suggestedAmountCents;
}

export function sumActiveSponsorCents(
  sponsors: { active: boolean; amount_cents?: number | null; tier: TournamentSponsorTier }[]
): number {
  return sponsors.filter((s) => s.active).reduce((sum, s) => sum + sponsorAmountCents(s), 0);
}
