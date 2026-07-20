import { getDemoClubIdFallback } from '@/lib/demo-constants';

export type FamilyAccountType = 'tutor' | 'player';
export type FamilyAccountStatus = 'invited' | 'active' | 'disabled';
export type FamilyPlayerRelationship = 'tutor' | 'self';

export type FamilyAccount = {
  id: string;
  club_id: string;
  user_id: string | null;
  email: string;
  display_name: string | null;
  account_type: FamilyAccountType;
  status: FamilyAccountStatus;
  invited_at: string;
  activated_at: string | null;
};

export type FamilyPlayerLink = {
  id: string;
  club_id: string;
  family_account_id: string;
  player_id: string;
  relationship: FamilyPlayerRelationship;
  is_primary: boolean;
};

export type LinkedPlayer = {
  id: string;
  display_name: string;
  is_minor: boolean;
  team_name: string;
  relationship: FamilyPlayerRelationship;
};

export type FamilyContext = {
  account: FamilyAccount;
  club: {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    invite_code: string;
  };
  players: LinkedPlayer[];
};

export const FAMILY_ACCOUNT_TYPE_LABELS: Record<FamilyAccountType, string> = {
  tutor: 'Tutor / madre / padre',
  player: 'Jugador mayor',
};

export const FAMILY_ACCOUNT_STATUS_LABELS: Record<FamilyAccountStatus, string> = {
  invited: 'Invitado',
  active: 'Activo',
  disabled: 'Desactivado',
};

export const DEMO_FAMILY_ACCOUNT: FamilyAccount = {
  id: 'demo-family-ana',
  club_id: getDemoClubIdFallback(),
  user_id: null,
  email: 'ana.castro@email.com',
  display_name: 'Ana Castro',
  account_type: 'tutor',
  status: 'active',
  invited_at: '2026-01-15T10:00:00.000Z',
  activated_at: '2026-01-15T10:05:00.000Z',
};

export const DEMO_FAMILY_PLAYERS: LinkedPlayer[] = [
  {
    id: 'demo-pl-ale-1',
    display_name: 'Alejandro Castro',
    is_minor: true,
    team_name: 'Alevín A',
    relationship: 'tutor',
  },
];

export function staticDemoFamilyContext(): FamilyContext {
  return {
    account: DEMO_FAMILY_ACCOUNT,
    club: {
      id: getDemoClubIdFallback(),
      name: 'Club Demo SynqAI',
      slug: 'club-demo-synqai',
      logo_url: '/demo/club-demo-logo.svg',
      invite_code: 'DEMO2026',
    },
    players: DEMO_FAMILY_PLAYERS,
  };
}

export function canFamilyBookForPlayer(
  account: Pick<FamilyAccount, 'account_type'>,
  player: Pick<LinkedPlayer, 'is_minor' | 'relationship'>
): boolean {
  if (player.relationship === 'self') {
    return account.account_type === 'player' && !player.is_minor;
  }
  return account.account_type === 'tutor' && player.is_minor;
}

export const FAMILY_SELECT =
  'id, club_id, user_id, email, display_name, account_type, status, invited_at, activated_at';

export const FAMILY_LINK_SELECT =
  'id, club_id, family_account_id, player_id, relationship, is_primary';
