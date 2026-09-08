export const PUBLIC_TOURNAMENT_TABS = [
  { id: 'horarios', label: 'Horarios' },
  { id: 'clasificacion', label: 'Clasificación' },
  { id: 'cruces', label: 'Cruces' },
  { id: 'patrocinadores', label: 'Patrocinadores' },
] as const;

export type PublicTournamentTabId = (typeof PUBLIC_TOURNAMENT_TABS)[number]['id'];

export function parsePublicTournamentTab(value: string | undefined): PublicTournamentTabId {
  const ids = PUBLIC_TOURNAMENT_TABS.map((t) => t.id);
  if (value && ids.includes(value as PublicTournamentTabId)) return value as PublicTournamentTabId;
  return 'horarios';
}
