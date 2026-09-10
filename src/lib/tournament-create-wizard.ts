import type { CategorySchedulingWindow } from '@/lib/tournaments';
import type { FieldDivisionMode, FormatType, TournamentSport } from '@/lib/tournaments';
import type { TournamentSchedulingConfig } from '@/lib/tournament-scheduling';

export type WizardCategoryDraft = {
  tempId: string;
  name: string;
  groups_count: number;
  teams_per_group: number;
  format_type: FormatType;
};

export type WizardFieldDraft = {
  tempId: string;
  label: string;
  division_mode: FieldDivisionMode;
  notes: string;
};

export type CreateTournamentWizardPayload = {
  name: string;
  sport_key: TournamentSport;
  venue_name: string | null;
  starts_at: string | null;
  ends_at: string | null;
  description: string | null;
  rules_text: string | null;
  categories: WizardCategoryDraft[];
  fields: WizardFieldDraft[];
  scheduling: TournamentSchedulingConfig;
};

export function newCategoryDraft(name = ''): WizardCategoryDraft {
  return {
    tempId: `cat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    groups_count: 4,
    teams_per_group: 4,
    format_type: 'groups_multifinal',
  };
}

export function newFieldDraft(): WizardFieldDraft {
  return {
    tempId: `field-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    label: '',
    division_mode: 'halves_2',
    notes: '',
  };
}

export type WizardCategoryWindow = CategorySchedulingWindow & { categoryTempId: string };
