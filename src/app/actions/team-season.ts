'use server';

import { isDemoActive } from '@/lib/demo';
import { requireClubId } from '@/lib/auth-staff';
import {
  getCanteraCategory,
  type CanteraCategorySlug,
} from '@/lib/cantera-categories';
import { DEMO_CANTERA_TEAMS, formatTeamName } from '@/lib/cantera-teams';
import {
  parsePlayerHistoryJson,
  prependPlayerHistoryEvent,
  buildTeamMoveHistoryEvent,
} from '@/lib/player-club-history';
import {
  parseTeamHistoryJson,
  prependTeamHistoryEvent,
  type TeamClubHistoryKind,
} from '@/lib/team-club-history';
import {
  buildPlayerPromotionHistoryEvents,
  buildTeamSeasonHistoryEvent,
  getNextCategorySlug,
  parsePlayerSeasonDecisions,
  previewTeamName,
  type PlayerSeasonDecision,
} from '@/lib/team-season';
import { getUsedTeamLetters } from '@/app/actions/cantera';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type SeasonActionState = {
  ok: boolean;
  message?: string;
  report?: string;
};

type TeamRow = {
  id: string;
  name: string;
  category: string;
  category_slug: string | null;
  team_letter: string | null;
  team_history_json: unknown;
};

type PlayerRow = {
  id: string;
  team_id: string | null;
  birth_year: number | null;
  display_name: string;
  first_name: string | null;
  last_name: string | null;
  player_history_json: unknown;
};

async function loadTeam(clubId: string, teamId: string): Promise<TeamRow | null> {
  if (await isDemoActive()) {
    const demo = DEMO_CANTERA_TEAMS.find((team) => team.id === teamId);
    if (!demo) return null;
    return {
      id: demo.id,
      name: demo.name,
      category: demo.category,
      category_slug: demo.category_slug,
      team_letter: demo.team_letter,
      team_history_json: [],
    };
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from('synq_teams')
    .select('id, name, category, category_slug, team_letter, team_history_json')
    .eq('id', teamId)
    .eq('club_id', clubId)
    .maybeSingle();

  return data as TeamRow | null;
}

async function loadTeamPlayers(clubId: string, teamId: string): Promise<PlayerRow[]> {
  if (await isDemoActive()) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from('synq_players')
    .select(
      'id, team_id, birth_year, display_name, first_name, last_name, player_history_json'
    )
    .eq('club_id', clubId)
    .eq('team_id', teamId)
    .eq('active', true);

  return (data ?? []) as PlayerRow[];
}

async function applyPlayerDecisions(
  clubId: string,
  fromTeam: TeamRow,
  decisions: PlayerSeasonDecision[]
): Promise<void> {
  if (decisions.length === 0) return;
  if (await isDemoActive()) return;

  const supabase = await createClient();

  for (const decision of decisions) {
    if (decision.action === 'promote') continue;

    const { data: player } = await supabase
      .from('synq_players')
      .select('id, player_history_json')
      .eq('id', decision.playerId)
      .eq('club_id', clubId)
      .maybeSingle();

    if (!player) continue;

    const history = parsePlayerHistoryJson(player.player_history_json);
    const occurredAt = new Date().toISOString();

    if (decision.action === 'unassign') {
      await supabase
        .from('synq_players')
        .update({
          team_id: null,
          player_history_json: prependPlayerHistoryEvent(history, {
            kind: 'team_change',
            title: 'Baja de plantilla',
            detail: `Plantilla · ${fromTeam.name} → Sin equipo (excepción en cierre de temporada)`,
            occurredAt,
          }),
        })
        .eq('id', decision.playerId)
        .eq('club_id', clubId);
      continue;
    }

    if (decision.action === 'move' && decision.targetTeamId) {
      const { data: targetTeam } = await supabase
        .from('synq_teams')
        .select('name, category, category_slug')
        .eq('id', decision.targetTeamId)
        .eq('club_id', clubId)
        .maybeSingle();

      if (!targetTeam) continue;

      const moveEvent = buildTeamMoveHistoryEvent({
        fromTeam: {
          name: fromTeam.name,
          category: fromTeam.category,
          category_slug: fromTeam.category_slug,
        },
        toTeam: targetTeam,
      });

      await supabase
        .from('synq_players')
        .update({
          team_id: decision.targetTeamId,
          player_history_json: prependPlayerHistoryEvent(history, moveEvent),
        })
        .eq('id', decision.playerId)
        .eq('club_id', clubId);
    }
  }
}

async function appendPromotionHistoryToPlayers(
  clubId: string,
  teamId: string,
  fromTeam: TeamRow,
  toTeam: { name: string; category: string; category_slug: string | null },
  seasonLabel: string
): Promise<number> {
  const players = await loadTeamPlayers(clubId, teamId);
  if (players.length === 0) return 0;
  if (await isDemoActive()) return players.length;

  const supabase = await createClient();

  for (const player of players) {
    const history = parsePlayerHistoryJson(player.player_history_json);
    const event = buildPlayerPromotionHistoryEvents({
      fromTeam: {
        name: fromTeam.name,
        category: fromTeam.category,
        category_slug: fromTeam.category_slug,
      },
      toTeam,
      seasonLabel,
    });

    await supabase
      .from('synq_players')
      .update({ player_history_json: prependPlayerHistoryEvent(history, event) })
      .eq('id', player.id)
      .eq('club_id', clubId);
  }

  return players.length;
}

function revalidateCanteraPaths() {
  revalidatePath('/portal/cantera');
  revalidatePath('/portal/cantera/equipos');
  revalidatePath('/portal/cantera/jugadores');
}

export async function promoteTeamSeason(
  _prev: SeasonActionState,
  formData: FormData
): Promise<SeasonActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'unauthorized' };

  const teamId = String(formData.get('teamId') ?? '').trim();
  const targetCategorySlug = String(formData.get('targetCategorySlug') ?? '').trim() as CanteraCategorySlug;
  const targetTeamLetter = String(formData.get('targetTeamLetter') ?? '')
    .trim()
    .toUpperCase();
  const seasonLabel = String(formData.get('seasonLabel') ?? '').trim() || undefined;
  const decisions = parsePlayerSeasonDecisions(String(formData.get('playerDecisionsJson') ?? '[]'));

  if (!teamId || !targetCategorySlug || !/^[A-Z]$/.test(targetTeamLetter)) {
    return { ok: false, message: 'validation' };
  }

  const categoryMeta = getCanteraCategory(targetCategorySlug);
  if (!categoryMeta) return { ok: false, message: 'validation' };

  const team = await loadTeam(clubId, teamId);
  if (!team) return { ok: false, message: 'error' };

  const used = await getUsedTeamLetters(clubId, targetCategorySlug, teamId);
  if (used.includes(targetTeamLetter)) {
    return { ok: false, message: 'duplicate_letter' };
  }

  const fromLabel = team.name;
  const toName = previewTeamName(targetCategorySlug, targetTeamLetter);
  const categoryChanged = team.category_slug !== targetCategorySlug;
  const letterChanged = team.team_letter !== targetTeamLetter;
  const historyKind: TeamClubHistoryKind = categoryChanged
    ? 'season_promotion'
    : 'letter_change';

  if (await isDemoActive()) {
    revalidateCanteraPaths();
    return {
      ok: true,
      message: 'demo',
      report: `${fromLabel} → ${toName} (demo, sin persistir)`,
    };
  }

  await applyPlayerDecisions(clubId, team, decisions);

  const playerCount = await appendPromotionHistoryToPlayers(
    clubId,
    teamId,
    team,
    {
      name: toName,
      category: categoryMeta.name,
      category_slug: targetCategorySlug,
    },
    seasonLabel ?? ''
  );

  const teamHistory = parseTeamHistoryJson(team.team_history_json);
  const teamEvent = buildTeamSeasonHistoryEvent({
    kind: historyKind,
    fromLabel,
    toLabel: toName,
    seasonLabel,
    playerCount,
  });

  const supabase = await createClient();
  const { error } = await supabase
    .from('synq_teams')
    .update({
      name: toName,
      category: categoryMeta.name,
      category_slug: targetCategorySlug,
      team_letter: targetTeamLetter,
      team_history_json: prependTeamHistoryEvent(teamHistory, teamEvent),
    })
    .eq('id', teamId)
    .eq('club_id', clubId);

  if (error) {
    console.error('promoteTeamSeason', error);
    return { ok: false, message: 'error' };
  }

  revalidateCanteraPaths();
  return {
    ok: true,
    report: `${fromLabel} → ${toName} · ${playerCount} jugadores actualizados`,
  };
}

export async function promoteCategorySeason(
  _prev: SeasonActionState,
  formData: FormData
): Promise<SeasonActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'unauthorized' };

  const sourceCategorySlug = String(formData.get('sourceCategorySlug') ?? '').trim() as CanteraCategorySlug;
  const seasonLabel = String(formData.get('seasonLabel') ?? '').trim() || undefined;

  const sourceMeta = getCanteraCategory(sourceCategorySlug);
  if (!sourceMeta) return { ok: false, message: 'validation' };

  if (await isDemoActive()) {
    revalidateCanteraPaths();
    return { ok: true, message: 'demo', report: 'Ascenso por categoría simulado en demo.' };
  }

  const supabase = await createClient();
  const { data: teams } = await supabase
    .from('synq_teams')
    .select('id, name, category, category_slug, team_letter, team_history_json, active')
    .eq('club_id', clubId)
    .eq('category_slug', sourceCategorySlug)
    .eq('active', true)
    .order('team_letter');

  const results: string[] = [];
  const errors: string[] = [];

  for (const team of teams ?? []) {
    if (!team.team_letter || !team.category_slug) continue;

    const fd = new FormData();
    fd.set('teamId', team.id);
    const nextSlug = getNextCategorySlug(team.category_slug as CanteraCategorySlug);
    if (!nextSlug) {
      errors.push(`${team.name}: sin categoría superior`);
      continue;
    }
    fd.set('targetCategorySlug', nextSlug);
    fd.set('targetTeamLetter', team.team_letter);
    if (seasonLabel) fd.set('seasonLabel', seasonLabel);
    fd.set('playerDecisionsJson', '[]');

    const result = await promoteTeamSeason({ ok: false }, fd);
    if (result.ok) {
      results.push(result.report ?? team.name);
    } else if (result.message === 'duplicate_letter') {
      errors.push(`${team.name}: letra ${team.team_letter} ocupada en destino`);
    } else {
      errors.push(`${team.name}: error al ascender`);
    }
  }

  revalidateCanteraPaths();
  const report = [
    results.length > 0 ? `Ascendidos: ${results.join('; ')}` : null,
    errors.length > 0 ? `Incidencias: ${errors.join('; ')}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  return {
    ok: errors.length === 0 || results.length > 0,
    report: report || 'No había equipos activos en esta categoría.',
  };
}

export async function mergeTeamRosters(
  _prev: SeasonActionState,
  formData: FormData
): Promise<SeasonActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'unauthorized' };

  const sourceTeamId = String(formData.get('sourceTeamId') ?? '').trim();
  const targetTeamId = String(formData.get('targetTeamId') ?? '').trim();
  const pauseSource = formData.get('pauseSource') === 'true';
  const seasonLabel = String(formData.get('seasonLabel') ?? '').trim() || undefined;
  const decisions = parsePlayerSeasonDecisions(String(formData.get('playerDecisionsJson') ?? '[]'));

  if (!sourceTeamId || !targetTeamId || sourceTeamId === targetTeamId) {
    return { ok: false, message: 'validation' };
  }

  const sourceTeam = await loadTeam(clubId, sourceTeamId);
  const targetTeam = await loadTeam(clubId, targetTeamId);
  if (!sourceTeam || !targetTeam) return { ok: false, message: 'error' };

  if (await isDemoActive()) {
    revalidateCanteraPaths();
    return { ok: true, message: 'demo', report: 'Fusión simulada en demo.' };
  }

  const supabase = await createClient();
  const players = await loadTeamPlayers(clubId, sourceTeamId);
  const promoteIds = new Set(
    players
      .filter((player) => {
        const decision = decisions.find((item) => item.playerId === player.id);
        return !decision || decision.action === 'promote' || decision.action === 'move';
      })
      .map((player) => player.id)
  );

  const exceptionDecisions = decisions.filter(
    (item) => item.action === 'unassign' || (item.action === 'move' && item.targetTeamId !== targetTeamId)
  );
  await applyPlayerDecisions(clubId, sourceTeam, exceptionDecisions);

  let moved = 0;
  for (const player of players) {
    if (!promoteIds.has(player.id)) continue;
    const decision = decisions.find((item) => item.playerId === player.id);
    const destinationId =
      decision?.action === 'move' && decision.targetTeamId
        ? decision.targetTeamId
        : targetTeamId;

    const { data: destTeam } = await supabase
      .from('synq_teams')
      .select('name, category, category_slug')
      .eq('id', destinationId)
      .eq('club_id', clubId)
      .maybeSingle();

    if (!destTeam) continue;

    const history = parsePlayerHistoryJson(player.player_history_json);
    const moveEvent = buildTeamMoveHistoryEvent({
      fromTeam: {
        name: sourceTeam.name,
        category: sourceTeam.category,
        category_slug: sourceTeam.category_slug,
      },
      toTeam: destTeam,
    });
    const detail = seasonLabel
      ? `${moveEvent.detail} · Fusión temporada ${seasonLabel}`
      : `${moveEvent.detail} · Fusión de plantillas`;

    await supabase
      .from('synq_players')
      .update({
        team_id: destinationId,
        player_history_json: prependPlayerHistoryEvent(history, { ...moveEvent, detail }),
      })
      .eq('id', player.id)
      .eq('club_id', clubId);
    moved += 1;
  }

  const sourceHistory = parseTeamHistoryJson(sourceTeam.team_history_json);
  const targetHistory = parseTeamHistoryJson(targetTeam.team_history_json);

  await supabase
    .from('synq_teams')
    .update({
      team_history_json: prependTeamHistoryEvent(
        sourceHistory,
        buildTeamSeasonHistoryEvent({
          kind: 'roster_merge',
          fromLabel: sourceTeam.name,
          toLabel: targetTeam.name,
          seasonLabel,
          playerCount: moved,
          extraDetail: 'Plantilla transferida',
        })
      ),
      ...(pauseSource ? { active: false } : {}),
    })
    .eq('id', sourceTeamId)
    .eq('club_id', clubId);

  await supabase
    .from('synq_teams')
    .update({
      team_history_json: prependTeamHistoryEvent(
        targetHistory,
        buildTeamSeasonHistoryEvent({
          kind: 'roster_merge',
          fromLabel: sourceTeam.name,
          toLabel: targetTeam.name,
          seasonLabel,
          playerCount: moved,
          extraDetail: 'Plantilla recibida',
        })
      ),
    })
    .eq('id', targetTeamId)
    .eq('club_id', clubId);

  revalidateCanteraPaths();
  return {
    ok: true,
    report: `Fusión completada: ${moved} jugadores de ${sourceTeam.name} → ${targetTeam.name}`,
  };
}
