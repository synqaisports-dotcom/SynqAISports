'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CalendarDays, ClipboardList, Layers, Pencil, Plus, TrendingUp, UserCog } from 'lucide-react';
import { CategorySeasonPromoteSheet } from '@/components/portal/CategorySeasonPromoteSheet';
import { TeamClubHistorySection } from '@/components/portal/TeamClubHistorySection';
import { TeamCoachingStaffSheet } from '@/components/portal/TeamCoachingStaffSheet';
import { TeamSeasonPromoteSheet } from '@/components/portal/TeamSeasonPromoteSheet';
import { TeamCreateForm } from '@/components/portal/TeamCreateForm';
import { TeamEditForm } from '@/components/portal/TeamEditForm';
import { TeamPauseButton } from '@/components/portal/TeamPauseButton';
import { PORTAL_ACTION_ICON_CLASS } from '@/components/portal/PortalActionIcon';
import { TeamRosterList } from '@/components/portal/TeamRosterList';
import { TeamViewSections } from '@/components/portal/TeamViewSections';
import { SynqSelect } from '@/components/portal/SynqSelect';
import { PortalSearchField } from '@/components/portal/PortalSearchField';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  PortalSheetBody,
  PortalSheetContent,
  PortalSheetHeader,
} from '@/components/portal/PortalSheet';
import { Sheet, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  CANTERA_CATEGORIES,
  getCanteraCategory,
  resolveTeamCategorySlug,
  type CanteraCategory,
  type CanteraCategorySlug,
} from '@/lib/cantera-categories';
import type { ClubFacility } from '@/lib/club-facilities';
import {
  TEAM_PURPOSE_LABELS,
  describeMatchVenue,
  describeTrainingSetup,
  type TeamTrainingSlot,
} from '@/lib/team-setup';
import {
  compareTeamsForList,
  usedTeamLettersInCategory,
  type TeamListSortMode,
  type TeamProfile,
} from '@/lib/team-profile';
import type { PlayerTeamOption } from '@/lib/player-teams';
import type { StaffProfile } from '@/lib/staff-profile';
import { sortPlayerTeamsByCategory } from '@/lib/player-teams';
import { cn } from '@/lib/utils';

type Props = {
  teams: TeamProfile[];
  facilities: ClubFacility[];
  trainingSlots: TeamTrainingSlot[];
  staff: StaffProfile[];
  initialTeamId?: string | null;
  initialEditOpen?: boolean;
  initialCreateOpen?: boolean;
  initialCreateCategory?: CanteraCategorySlug | null;
  demoMode?: boolean;
};

type StatusFilter = 'all' | 'active' | 'paused';
type SportFilter = 'all' | 'football' | 'futsal';

function teamCategoryMeta(team: TeamProfile) {
  const slug =
    team.category_slug ?? resolveTeamCategorySlug(team.category, team.category_slug);
  return slug ? (getCanteraCategory(slug) ?? null) : null;
}

function teamOptionsFromProfiles(teams: TeamProfile[]): PlayerTeamOption[] {
  return sortPlayerTeamsByCategory(
    teams.map((team) => ({
      id: team.id,
      name: team.name,
      category: team.category,
      category_slug: team.category_slug,
    }))
  );
}

function TeamDetailActions({
  team,
  onEdit,
  onRoster,
  onSeason,
  onStaff,
}: {
  team: TeamProfile;
  onEdit: () => void;
  onRoster: () => void;
  onSeason: () => void;
  onStaff: () => void;
}) {
  return (
    <div className="flex shrink-0 flex-nowrap items-center gap-0.5">
      <button
        type="button"
        className={PORTAL_ACTION_ICON_CLASS}
        aria-label="Editar equipo"
        title="Editar equipo"
        onClick={onEdit}
      >
        <Pencil className="size-4" />
      </button>
      <button
        type="button"
        className={PORTAL_ACTION_ICON_CLASS}
        aria-label="Ver plantilla del equipo"
        title="Ver plantilla del equipo"
        onClick={onRoster}
      >
        <ClipboardList className="size-4" />
      </button>
      <button
        type="button"
        className={PORTAL_ACTION_ICON_CLASS}
        aria-label="Cierre de temporada"
        title="Cierre de temporada (ascenso, letra o fusión)"
        onClick={onSeason}
      >
        <TrendingUp className="size-4" />
      </button>
      <button
        type="button"
        className={PORTAL_ACTION_ICON_CLASS}
        aria-label="Ver cuerpo técnico"
        title="Ver cuerpo técnico del equipo"
        onClick={onStaff}
      >
        <UserCog className="size-4" />
      </button>
      <Link
        href="/portal/cantera/horarios"
        className={PORTAL_ACTION_ICON_CLASS}
        aria-label="Ver horarios"
        title="Ver horarios del club"
      >
        <CalendarDays className="size-4" />
      </Link>
      <TeamPauseButton teamId={team.id} teamName={team.name} active={team.active} />
    </div>
  );
}

function TeamDetailPanel({
  team,
  facilities,
  trainingSlots,
  teams,
  staff,
  initialEditOpen,
}: {
  team: TeamProfile | null;
  facilities: ClubFacility[];
  trainingSlots: TeamTrainingSlot[];
  teams: TeamProfile[];
  staff: StaffProfile[];
  initialEditOpen?: boolean;
}) {
  const [editOpen, setEditOpen] = useState(Boolean(initialEditOpen));
  const [rosterOpen, setRosterOpen] = useState(false);
  const [seasonOpen, setSeasonOpen] = useState(false);
  const [staffOpen, setStaffOpen] = useState(false);

  useEffect(() => {
    setEditOpen(Boolean(initialEditOpen));
  }, [team?.id, initialEditOpen]);

  useEffect(() => {
    setRosterOpen(false);
    setSeasonOpen(false);
    setStaffOpen(false);
  }, [team?.id]);

  if (!team) {
    return (
      <Card className="flex h-full min-h-[28rem] flex-col border border-primary/25">
        <CardContent className="flex flex-1 items-center justify-center p-8">
          <p className="text-center text-sm text-muted-foreground">
            Selecciona un equipo de la lista para ver su ficha.
          </p>
        </CardContent>
      </Card>
    );
  }

  const category = teamCategoryMeta(team);
  const occupiedSlots = trainingSlots.filter((slot) => slot.teamId !== team.id);
  const usedLetters = usedTeamLettersInCategory(
    teams,
    team.category_slug ?? '',
    team.id
  );
  const teamOptions = teamOptionsFromProfiles(teams);

  return (
    <Card className="flex h-full min-h-[28rem] flex-col border border-primary/25">
      <CardHeader className="space-y-2 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-lg font-semibold tracking-tight">{team.name}</CardTitle>
              {category ? (
                <Badge variant="outline" className={cn('text-[10px]', category.badgeClass)}>
                  {category.name}
                </Badge>
              ) : null}
              <Badge variant="secondary" className="text-[10px]">
                {team.player_count} jugadores
              </Badge>
              {!team.active ? (
                <Badge variant="outline" className="text-[10px]">
                  Pausado
                </Badge>
              ) : null}
            </div>
          </div>
          <TeamDetailActions
            team={team}
            onEdit={() => setEditOpen(true)}
            onRoster={() => setRosterOpen(true)}
            onSeason={() => setSeasonOpen(true)}
            onStaff={() => setStaffOpen(true)}
          />
        </div>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-y-auto">
        <TeamViewSections
          category={category}
          team={{
            id: team.id,
            name: team.name,
            team_letter: team.team_letter,
            sport: team.sport,
            active: team.active,
            categoryName: team.category,
            teamPurpose: TEAM_PURPOSE_LABELS[team.setup.team_purpose],
            trainingSummary: describeTrainingSetup(team.setup, team.facility_name),
            matchVenueSummary: describeMatchVenue(team.setup),
            externalVenueAddress:
              team.setup.match_venue_type === 'external'
                ? team.setup.external_venue_address
                : null,
          }}
        />
        <TeamClubHistorySection events={team.history} />
      </CardContent>

      <TeamSeasonPromoteSheet
        team={team}
        teams={teams}
        teamOptions={teamOptions}
        open={seasonOpen}
        onOpenChange={setSeasonOpen}
      />

      <TeamCoachingStaffSheet
        team={team}
        staff={staff}
        open={staffOpen}
        onOpenChange={setStaffOpen}
      />

      <Sheet open={rosterOpen} onOpenChange={setRosterOpen}>
        <PortalSheetContent maxWidth="md">
          <PortalSheetHeader>
            <SheetHeader className="space-y-2 text-left">
              <SheetTitle className="text-xl tracking-tight">Plantilla · {team.name}</SheetTitle>
            </SheetHeader>
          </PortalSheetHeader>
          <PortalSheetBody>
            <TeamRosterList
              teamId={team.id}
              teamName={team.name}
              players={team.players}
              teams={teamOptions}
            />
          </PortalSheetBody>
        </PortalSheetContent>
      </Sheet>

      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <PortalSheetContent maxWidth="2xl">
          <PortalSheetHeader>
            <SheetHeader className="space-y-2 text-left">
              <SheetTitle className="text-xl tracking-tight">Editar equipo</SheetTitle>
            </SheetHeader>
          </PortalSheetHeader>
          <PortalSheetBody>
            <TeamEditForm
              key={team.id}
              teamId={team.id}
              teamLetter={team.team_letter ?? 'A'}
              sport={team.sport}
              category={category}
              usedLetters={usedLetters}
              facilities={facilities}
              occupiedSlots={occupiedSlots}
              initialSetup={team.setup}
              onSaved={() => setEditOpen(false)}
            />
          </PortalSheetBody>
        </PortalSheetContent>
      </Sheet>
    </Card>
  );
}

export function TeamsMasterDetail({
  teams,
  facilities,
  trainingSlots,
  staff,
  initialTeamId,
  initialEditOpen,
  initialCreateOpen,
  initialCreateCategory,
  demoMode,
}: Props) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sportFilter, setSportFilter] = useState<SportFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortMode, setSortMode] = useState<TeamListSortMode>('category');
  const [createOpen, setCreateOpen] = useState(Boolean(initialCreateOpen));
  const [categorySeasonOpen, setCategorySeasonOpen] = useState(false);
  const [createCategorySlug, setCreateCategorySlug] = useState<CanteraCategorySlug>(
    initialCreateCategory && CANTERA_CATEGORIES.some((item) => item.slug === initialCreateCategory)
      ? initialCreateCategory
      : CANTERA_CATEGORIES[0].slug
  );
  const [selectedId, setSelectedId] = useState<string | null>(
    initialTeamId && teams.some((team) => team.id === initialTeamId)
      ? initialTeamId
      : teams[0]?.id ?? null
  );
  const filteredTeams = useMemo(() => {
    const query = search.trim().toLowerCase();
    let list = [...teams];

    if (query) {
      list = list.filter((team) => {
        const haystack = [team.name, team.category, team.team_letter]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(query);
      });
    }

    if (categoryFilter !== 'all') {
      list = list.filter((team) => team.category_slug === categoryFilter);
    }

    if (sportFilter !== 'all') {
      list = list.filter((team) => team.sport === sportFilter);
    }

    if (statusFilter === 'active') {
      list = list.filter((team) => team.active);
    } else if (statusFilter === 'paused') {
      list = list.filter((team) => !team.active);
    }

    list.sort((a, b) => compareTeamsForList(a, b, sortMode));
    return list;
  }, [teams, search, categoryFilter, sportFilter, statusFilter, sortMode]);

  const groupedTeams = useMemo(() => {
    if (sortMode !== 'category' && categoryFilter !== 'all') {
      return [{ category: getCanteraCategory(categoryFilter as CanteraCategorySlug)!, teams: filteredTeams }];
    }

    if (sortMode !== 'category') {
      return [{ category: null, teams: filteredTeams }];
    }

    const groups: { category: CanteraCategory | null; teams: TeamProfile[] }[] =
      CANTERA_CATEGORIES.map((category) => ({
        category,
        teams: filteredTeams.filter((team) => team.category_slug === category.slug),
      })).filter((group) => group.teams.length > 0);

    const uncategorized = filteredTeams.filter((team) => !team.category_slug);
    if (uncategorized.length > 0) {
      groups.push({ category: null, teams: uncategorized });
    }

    return groups;
  }, [filteredTeams, sortMode, categoryFilter]);

  const selectedTeam =
    teams.find((team) => team.id === selectedId) ?? filteredTeams[0] ?? null;

  const createCategory =
    CANTERA_CATEGORIES.find((item) => item.slug === createCategorySlug) ?? CANTERA_CATEGORIES[0];
  const createUsedLetters = usedTeamLettersInCategory(teams, createCategory.slug);

  useEffect(() => {
    if (initialTeamId && teams.some((team) => team.id === initialTeamId)) {
      setSelectedId(initialTeamId);
    }
  }, [initialTeamId, teams]);

  useEffect(() => {
    if (selectedId && !teams.some((team) => team.id === selectedId)) {
      setSelectedId(teams[0]?.id ?? null);
    }
  }, [teams, selectedId]);

  useEffect(() => {
    if (initialCreateOpen) setCreateOpen(true);
  }, [initialCreateOpen]);

  useEffect(() => {
    if (
      initialCreateCategory &&
      CANTERA_CATEGORIES.some((item) => item.slug === initialCreateCategory)
    ) {
      setCreateCategorySlug(initialCreateCategory);
    }
  }, [initialCreateCategory]);

  const handleSelect = (teamId: string) => {
    setSelectedId(teamId);
    router.replace(`/portal/cantera/equipos?team=${teamId}`, { scroll: false });
  };

  const handleTeamCreated = (teamId: string) => {
    setCreateOpen(false);
    setSelectedId(teamId);
    router.replace(`/portal/cantera/equipos?team=${teamId}`, { scroll: false });
    router.refresh();
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
      <Card className="flex min-h-[28rem] flex-col border border-primary/25 lg:sticky lg:top-[4.5rem] lg:max-h-[calc(100vh-5.5rem)]">
        <CardHeader className="space-y-3 pb-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="text-base">Equipos</CardTitle>
              <CardDescription>
                {filteredTeams.length} de {teams.length} equipos
              </CardDescription>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className={cn(PORTAL_ACTION_ICON_CLASS, 'shrink-0')}
                aria-label="Cierre de temporada por categoría"
                title="Cierre de temporada por categoría"
                onClick={() => setCategorySeasonOpen(true)}
              >
                <TrendingUp className="size-4" />
              </button>
              <button
                type="button"
                className={cn(PORTAL_ACTION_ICON_CLASS, 'shrink-0')}
                aria-label="Nuevo equipo"
                title="Nuevo equipo"
                onClick={() => setCreateOpen(true)}
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <PortalSearchField
              value={search}
              onChange={setSearch}
              placeholder="Buscar por nombre o categoría…"
            />
            <div className="grid gap-2 sm:grid-cols-2">
              <SynqSelect
                value={categoryFilter}
                onChange={setCategoryFilter}
                options={[
                  { value: 'all', label: 'Todas las categorías' },
                  ...CANTERA_CATEGORIES.map((category) => ({
                    value: category.slug,
                    label: category.name,
                  })),
                ]}
              />
              <SynqSelect
                value={sortMode}
                onChange={(value) => setSortMode(value as TeamListSortMode)}
                options={[
                  { value: 'category', label: 'Por categoría' },
                  { value: 'name-asc', label: 'A → Z' },
                  { value: 'name-desc', label: 'Z → A' },
                ]}
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <SynqSelect
                value={sportFilter}
                onChange={(value) => setSportFilter(value as SportFilter)}
                options={[
                  { value: 'all', label: 'Todos los deportes' },
                  { value: 'football', label: 'Fútbol' },
                  { value: 'futsal', label: 'Fútbol sala' },
                ]}
              />
              <SynqSelect
                value={statusFilter}
                onChange={(value) => setStatusFilter(value as StatusFilter)}
                options={[
                  { value: 'all', label: 'Activos y pausados' },
                  { value: 'active', label: 'Solo activos' },
                  { value: 'paused', label: 'Solo pausados' },
                ]}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="min-h-0 flex-1 overflow-y-auto pt-0">
          {filteredTeams.length === 0 ? (
            <p className="rounded-lg border border-dashed border-primary/20 px-4 py-8 text-center text-sm text-muted-foreground">
              {teams.length === 0
                ? 'No hay equipos todavía. Pulsa + para crear el primero.'
                : 'No hay equipos con esos filtros.'}
            </p>
          ) : (
            <div className="space-y-4">
              {groupedTeams.map((group) => (
                <section key={group.category?.slug ?? 'uncategorized'}>
                  {group.category ? (
                    <div className="mb-2 flex flex-wrap items-center gap-2 px-1">
                      <Layers className="size-3.5 text-primary/80" />
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {group.category.name}
                      </p>
                      <Badge variant="outline" className={cn('text-[10px]', group.category.badgeClass)}>
                        {group.category.ages}
                      </Badge>
                    </div>
                  ) : sortMode === 'category' ? (
                    <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Sin categoría
                    </p>
                  ) : null}
                  <ul className="space-y-1.5">
                    {group.teams.map((team) => {
                      const active = selectedTeam?.id === team.id;
                      const category = teamCategoryMeta(team);
                      const sportLabel = team.sport === 'futsal' ? 'Fútbol sala' : 'Fútbol';

                      return (
                        <li key={team.id}>
                          <button
                            type="button"
                            onClick={() => handleSelect(team.id)}
                            className={cn(
                              'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors',
                              active
                                ? 'border-primary/50 bg-primary/10 shadow-[inset_2px_0_0_0_hsl(183_100%_50%)]'
                                : 'border-primary/15 bg-muted/5 hover:border-primary/30 hover:bg-primary/5',
                              !team.active && 'opacity-75'
                            )}
                          >
                            <div
                              className={cn(
                                'flex size-11 shrink-0 items-center justify-center rounded-lg border text-sm font-bold',
                                category?.badgeClass ?? 'border-primary/25 bg-muted/20 text-primary'
                              )}
                            >
                              {team.team_letter ?? '—'}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <p className="truncate text-sm font-semibold text-foreground">
                                  {team.name}
                                </p>
                                {!team.active ? (
                                  <Badge variant="outline" className="text-[10px]">
                                    Pausado
                                  </Badge>
                                ) : null}
                              </div>
                              <p className="truncate text-xs text-muted-foreground">
                                {sportLabel} · {team.player_count} jugadores
                              </p>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <TeamDetailPanel
        team={selectedTeam}
        facilities={facilities}
        trainingSlots={trainingSlots}
        teams={teams}
        staff={staff}
        initialEditOpen={initialEditOpen && selectedTeam?.id === initialTeamId}
      />

      <CategorySeasonPromoteSheet
        teams={teams}
        open={categorySeasonOpen}
        onOpenChange={setCategorySeasonOpen}
      />

      <Sheet open={createOpen} onOpenChange={setCreateOpen}>
        <PortalSheetContent maxWidth="2xl">
          <PortalSheetHeader>
            <SheetHeader className="space-y-2 text-left">
              <SheetTitle className="text-xl tracking-tight">Nuevo equipo</SheetTitle>
            </SheetHeader>
          </PortalSheetHeader>
          <PortalSheetBody>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Categoría
                </label>
                <SynqSelect
                  value={createCategorySlug}
                  onChange={(value) => setCreateCategorySlug(value as CanteraCategorySlug)}
                  options={CANTERA_CATEGORIES.map((category) => ({
                    value: category.slug,
                    label: `${category.name} · ${category.ages}`,
                  }))}
                />
              </div>
              <TeamCreateForm
                key={createCategory.slug}
                category={createCategory}
                usedLetters={createUsedLetters}
                facilities={facilities}
                occupiedSlots={trainingSlots}
                onCreated={handleTeamCreated}
              />
            </div>
          </PortalSheetBody>
        </PortalSheetContent>
      </Sheet>
    </div>
  );
}
