export type PublicAdSlotId =
  | 'sidebar-top'
  | 'sidebar-mid'
  | 'sidebar-bottom'
  | 'mobile-banner'
  | 'content-inline';

export type PublicAdSlotConfig = {
  id: PublicAdSlotId;
  label: string;
  /** AdSense slot id (numeric string) */
  slotEnvKey: string;
  width: number;
  height: number;
  format?: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
};

export const PUBLIC_AD_SLOTS: PublicAdSlotConfig[] = [
  {
    id: 'sidebar-top',
    label: 'Lateral superior',
    slotEnvKey: 'NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_SIDEBAR_TOP',
    width: 300,
    height: 250,
    format: 'rectangle',
  },
  {
    id: 'sidebar-mid',
    label: 'Lateral medio',
    slotEnvKey: 'NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_SIDEBAR_MID',
    width: 300,
    height: 600,
    format: 'vertical',
  },
  {
    id: 'sidebar-bottom',
    label: 'Lateral inferior',
    slotEnvKey: 'NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_SIDEBAR_BOTTOM',
    width: 300,
    height: 250,
    format: 'rectangle',
  },
  {
    id: 'mobile-banner',
    label: 'Banner móvil',
    slotEnvKey: 'NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_MOBILE',
    width: 320,
    height: 100,
    format: 'horizontal',
  },
  {
    id: 'content-inline',
    label: 'Entre contenido',
    slotEnvKey: 'NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_INLINE',
    width: 728,
    height: 90,
    format: 'horizontal',
  },
];

export function getPublicAdClientId(): string | undefined {
  return process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT?.trim() || undefined;
}

export function getPublicAdSlotId(config: PublicAdSlotConfig): string | undefined {
  const value = process.env[config.slotEnvKey]?.trim();
  return value || undefined;
}

export function isPublicAdsEnabled(): boolean {
  const client = getPublicAdClientId();
  if (!client) return false;
  return PUBLIC_AD_SLOTS.some((slot) => Boolean(getPublicAdSlotId(slot)));
}

export function getPublicAdSlotById(id: PublicAdSlotId): PublicAdSlotConfig {
  const slot = PUBLIC_AD_SLOTS.find((s) => s.id === id);
  if (!slot) throw new Error(`Unknown ad slot: ${id}`);
  return slot;
}
