import type { ClubRow } from '@/lib/portal';
import {
  FacebookIcon,
  GlobeIcon,
  TikTokIcon,
  XIcon,
  YouTubeIcon,
} from '@/components/icons/social';
import type { ComponentType } from 'react';

export type ClubSocialKey = 'website' | 'facebook' | 'x' | 'tiktok' | 'youtube';

export type ClubSocialLink = {
  key: ClubSocialKey;
  label: string;
  url: string | null;
  Icon: ComponentType<{ className?: string }>;
};

export const CLUB_SOCIAL_FORM_NAMES: Record<ClubSocialKey, string> = {
  website: 'websiteUrl',
  facebook: 'facebookUrl',
  x: 'xUrl',
  tiktok: 'tiktokUrl',
  youtube: 'youtubeUrl',
};

export const CLUB_SOCIAL_FIELDS: {
  key: ClubSocialKey;
  label: string;
  field: keyof ClubRow;
  placeholder: string;
  Icon: ComponentType<{ className?: string }>;
}[] = [
  {
    key: 'website',
    label: 'Web oficial',
    field: 'website_url',
    placeholder: 'https://miclub.es',
    Icon: GlobeIcon,
  },
  {
    key: 'facebook',
    label: 'Facebook',
    field: 'facebook_url',
    placeholder: 'https://facebook.com/miclub',
    Icon: FacebookIcon,
  },
  {
    key: 'x',
    label: 'X (Twitter)',
    field: 'x_url',
    placeholder: 'https://x.com/miclub',
    Icon: XIcon,
  },
  {
    key: 'tiktok',
    label: 'TikTok',
    field: 'tiktok_url',
    placeholder: 'https://tiktok.com/@miclub',
    Icon: TikTokIcon,
  },
  {
    key: 'youtube',
    label: 'YouTube',
    field: 'youtube_url',
    placeholder: 'https://youtube.com/@miclub',
    Icon: YouTubeIcon,
  },
];

export function getClubSocialLinks(club: ClubRow): ClubSocialLink[] {
  return CLUB_SOCIAL_FIELDS.map(({ key, label, field, Icon }) => ({
    key,
    label,
    url: club[field] as string | null,
    Icon,
  }));
}

export function normalizeExternalUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}
