'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Pencil, Phone, Plus, User, UserCog } from 'lucide-react';
import { SportPersonForm } from '@/components/portal/SportPersonForm';
import { PortalSearchField } from '@/components/portal/PortalSearchField';
import { SynqSelect } from '@/components/portal/SynqSelect';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ACCESS_PROFILE_LABELS, sportAccessProfileOptions } from '@/lib/club-people';
import type { TeamOption } from '@/lib/person-assignments';
import { medicalStatus } from '@/lib/profile-row';
import {
  compareStaffForList,
  staffAccessProfileLabel,
  staffAssignedToTeam,
  staffAssignmentRows,
  type StaffListSortMode,
  type StaffProfile,
} from '@/lib/staff-profile';
import { cn } from '@/lib/utils';

type Props = {
  clubId: string;
  people: StaffProfile[];
  teams: TeamOption[];
  initialPersonId?: string | null;
  initialTeamFilter?: string | null;
  initialCreateOpen?: boolean;
  initialEditOpen?: boolean;
  demoMode?: boolean;
};

function StaffListPhoto({ person }: { person: StaffProfile }) {
  const medical = medicalStatus(person);
  return (
    <div className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-primary/25 bg-muted/20">
      {person.photo_url ? (
        <Image
          src={person.photo_url}
          alt={person.full_name}
          fill
          className="object-cover"
          sizes="44px"
        />
      ) : (
        <UserCog className="size-4 text-primary/70" strokeWidth={1.5} />
      )}
      <span
        className={cn(
          'absolute -bottom-1 -right-1 rounded px-1 text-[8px] font-bold uppercase tracking-wide',
          medical.ok ? 'bg-primary text-primary-foreground' : 'bg-destructive text-white'
        )}
      >
        {medical.ok ? 'OK' : '!'}
      </span>
    </div>
  );
}

function StaffDetailPanel({
  clubId,
  person,
  teams,
  demoMode,
  initialEditOpen,
}: {
  clubId: string;
  person: StaffProfile | null;
  teams: TeamOption[];
  demoMode?: boolean;
  initialEditOpen?: boolean;
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(Boolean(initialEditOpen));
  const actionButtonClass =
    'inline-flex size-9 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/10 hover:text-primary';
  const sectionClass = 'rounded-xl border border-primary/15 bg-muted/5 p-4';

  useEffect(() => {
    setEditOpen(Boolean(initialEditOpen));
  }, [person?.id, initialEditOpen]);

  if (!person) {
    return (
      <Card className="flex h-full min-h-[28rem] flex-col border border-primary/25">
        <CardContent className="flex flex-1 items-center justify-center p-8">
          <p className="text-center text-sm text-muted-foreground">
            Selecciona una ficha de staff para ver su detalle.
          </p>
        </CardContent>
      </Card>
    );
  }

  const medical = medicalStatus(person);
  const assignmentRows = staffAssignmentRows(person, teams);

  return (
    <Card className="flex h-full min-h-[28rem] flex-col border border-primary/25">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-lg font-semibold tracking-tight">
                {person.full_name}
              </CardTitle>
              <Badge variant={medical.ok ? 'default' : 'destructive'} className="text-[10px]">
                {medical.label}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-primary">{person.sport_role}</p>
            <p className="text-xs text-muted-foreground">{staffAccessProfileLabel(person)}</p>
          </div>
          <button
            type="button"
            className={actionButtonClass}
            aria-label="Modificar ficha"
            title="Modificar ficha"
            onClick={() => setEditOpen(true)}
          >
            <Pencil className="size-4" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 space-y-4 overflow-y-auto">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:items-stretch">
          <div className="relative mx-auto min-h-[12rem] w-full max-w-[10rem] overflow-hidden rounded-2xl border border-primary/30 bg-muted/20 sm:mx-0 sm:h-full sm:max-w-none">
            {person.photo_url ? (
              <Image
                src={person.photo_url}
                alt={person.full_name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 10rem, 33vw"
              />
            ) : (
              <div className="flex h-full min-h-[12rem] items-center justify-center">
                <User className="size-12 text-primary/60" strokeWidth={1.25} />
              </div>
            )}
          </div>

          <div className={`${sectionClass} space-y-4`}>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Contacto
              </p>
              <div className="mt-2 space-y-1.5 text-sm text-foreground">
                <p className="flex items-center gap-2">
                  <Mail className="size-3.5 text-muted-foreground" />
                  {person.email || '—'}
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="size-3.5 text-muted-foreground" />
                  {person.phone || '—'}
                </p>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Reconocimiento médico
              </p>
              <p className="mt-0.5 text-sm text-foreground">
                {person.medical_until
                  ? medical.ok
                    ? `Válido hasta ${person.medical_until}`
                    : `Caducado (${person.medical_until})`
                  : 'Pendiente'}
              </p>
            </div>
          </div>
        </div>

        <section className={`${sectionClass} space-y-3`}>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Asignaciones
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Equipos y categorías donde ejerce su rol en el club.
            </p>
          </div>
          {assignmentRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin asignaciones todavía.</p>
          ) : (
            <ul className="space-y-2">
              {assignmentRows.map((row, index) => (
                <li key={`${row.label}-${index}`}>
                  {row.href ? (
                    <Link
                      href={row.href}
                      className="block rounded-lg border border-primary/15 bg-background/40 px-3 py-2 text-sm transition-colors hover:border-primary/35 hover:bg-primary/5"
                    >
                      {row.label}
                    </Link>
                  ) : (
                    <div className="rounded-lg border border-primary/15 bg-background/40 px-3 py-2 text-sm">
                      {row.label}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {person.notes ? (
          <section className={sectionClass}>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Notas
            </p>
            <p className="mt-2 text-sm text-foreground">{person.notes}</p>
          </section>
        ) : null}

        {demoMode ? (
          <p className="rounded-lg border border-primary/20 bg-muted/10 p-3 text-xs text-muted-foreground">
            Ficha de demostración. En tu club real podrás guardar cambios y asignaciones.
          </p>
        ) : null}
      </CardContent>

      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent
          side="right"
          className="w-full overflow-y-auto border-primary/20 sm:max-w-2xl"
        >
          <SheetHeader>
            <SheetTitle>Modificar ficha</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <SportPersonForm
              key={person.id}
              clubId={clubId}
              person={person}
              teams={teams}
              initialAssignments={person.assignments}
              onSaved={() => {
                setEditOpen(false);
                router.refresh();
              }}
            />
          </div>
        </SheetContent>
      </Sheet>
    </Card>
  );
}

export function StaffMasterDetail({
  clubId,
  people,
  teams,
  initialPersonId,
  initialTeamFilter,
  initialCreateOpen,
  initialEditOpen,
  demoMode,
}: Props) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [teamFilter, setTeamFilter] = useState(initialTeamFilter ?? 'all');
  const [profileFilter, setProfileFilter] = useState('all');
  const [sortMode, setSortMode] = useState<StaffListSortMode>('name-asc');
  const [createOpen, setCreateOpen] = useState(Boolean(initialCreateOpen));
  const [selectedId, setSelectedId] = useState<string | null>(
    initialPersonId && people.some((person) => person.id === initialPersonId)
      ? initialPersonId
      : people[0]?.id ?? null
  );

  const profileOptions = useMemo(() => sportAccessProfileOptions(), []);

  const filteredPeople = useMemo(() => {
    const query = search.trim().toLowerCase();
    let list = [...people];

    if (teamFilter !== 'all') {
      list = list.filter((person) => staffAssignedToTeam(person, teamFilter, teams));
    }

    if (profileFilter !== 'all') {
      list = list.filter((person) => person.access_profile === profileFilter);
    }

    if (query) {
      list = list.filter((person) => {
        const haystack = [
          person.full_name,
          person.sport_role,
          person.teams_label,
          person.email,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(query);
      });
    }

    list.sort((a, b) => compareStaffForList(a, b, sortMode));
    return list;
  }, [people, search, teamFilter, profileFilter, sortMode]);

  const selectedPerson =
    people.find((person) => person.id === selectedId) ?? filteredPeople[0] ?? null;

  const teamFilterLabel = useMemo(() => {
    if (teamFilter === 'all') return null;
    return teams.find((team) => team.id === teamFilter)?.name ?? null;
  }, [teamFilter, teams]);

  const teamFilterOptions = useMemo(
    () => [
      { value: 'all', label: 'Todos los equipos' },
      ...teams.map((team) => ({
        value: team.id,
        label: `${team.name} · ${team.category}`,
      })),
    ],
    [teams]
  );

  useEffect(() => {
    if (initialPersonId && people.some((person) => person.id === initialPersonId)) {
      setSelectedId(initialPersonId);
    }
  }, [initialPersonId, people]);

  useEffect(() => {
    if (initialTeamFilter) setTeamFilter(initialTeamFilter);
  }, [initialTeamFilter]);

  useEffect(() => {
    if (selectedId && !people.some((person) => person.id === selectedId)) {
      setSelectedId(people[0]?.id ?? null);
    }
  }, [people, selectedId]);

  useEffect(() => {
    if (initialCreateOpen) setCreateOpen(true);
  }, [initialCreateOpen]);

  const handleSelect = (personId: string) => {
    setSelectedId(personId);
    router.replace(`/portal/club/staff?person=${personId}`, { scroll: false });
  };

  const handlePersonSaved = (personId: string) => {
    setCreateOpen(false);
    setSelectedId(personId);
    router.replace(`/portal/club/staff?person=${personId}`, { scroll: false });
    router.refresh();
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
      <Card className="flex min-h-[28rem] flex-col border border-primary/25 lg:sticky lg:top-[4.5rem] lg:max-h-[calc(100vh-5.5rem)]">
        <CardHeader className="space-y-3 pb-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="text-base">Cuerpo técnico</CardTitle>
              <CardDescription>
                {filteredPeople.length} de {people.length} fichas
                {teamFilterLabel ? ` · ${teamFilterLabel}` : ''}
              </CardDescription>
            </div>
            <button
              type="button"
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
              aria-label="Nueva ficha"
              title="Nueva ficha de staff"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="size-4" />
            </button>
          </div>
          <div className="space-y-2">
            <PortalSearchField
              value={search}
              onChange={setSearch}
              placeholder="Buscar por nombre, cargo o equipo…"
            />
            <div className="grid gap-2 sm:grid-cols-2">
              <SynqSelect
                value={teamFilter}
                onChange={setTeamFilter}
                options={teamFilterOptions}
                placeholder="Equipo"
              />
              <SynqSelect
                value={profileFilter}
                onChange={setProfileFilter}
                options={[
                  { value: 'all', label: 'Todos los perfiles' },
                  ...profileOptions.map((option) => ({
                    value: option.value,
                    label: ACCESS_PROFILE_LABELS[option.value as keyof typeof ACCESS_PROFILE_LABELS],
                  })),
                ]}
              />
            </div>
            <SynqSelect
              value={sortMode}
              onChange={(value) => setSortMode(value as StaffListSortMode)}
              options={[
                { value: 'name-asc', label: 'A → Z (nombre)' },
                { value: 'name-desc', label: 'Z → A (nombre)' },
              ]}
            />
          </div>
        </CardHeader>
        <CardContent className="min-h-0 flex-1 overflow-y-auto pt-0">
          {filteredPeople.length === 0 ? (
            <p className="rounded-lg border border-dashed border-primary/20 px-4 py-8 text-center text-sm text-muted-foreground">
              {people.length === 0
                ? 'No hay fichas todavía. Pulsa + para crear la primera.'
                : 'No hay fichas con esos filtros.'}
            </p>
          ) : (
            <ul className="space-y-1.5">
              {filteredPeople.map((person) => {
                const active = selectedPerson?.id === person.id;
                const medical = medicalStatus(person);

                return (
                  <li key={person.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(person.id)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors',
                        active
                          ? 'border-primary/50 bg-primary/10 shadow-[inset_2px_0_0_0_hsl(183_100%_50%)]'
                          : 'border-primary/15 bg-muted/5 hover:border-primary/30 hover:bg-primary/5'
                      )}
                    >
                      <StaffListPhoto person={person} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {person.full_name}
                          </p>
                          <Badge
                            variant={medical.ok ? 'default' : 'destructive'}
                            className="text-[10px]"
                          >
                            {medical.label}
                          </Badge>
                        </div>
                        <p className="truncate text-xs text-muted-foreground">{person.sport_role}</p>
                        <p className="truncate text-[11px] text-primary/80">
                          {person.teams_label || 'Sin asignación'}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <StaffDetailPanel
        clubId={clubId}
        person={selectedPerson}
        teams={teams}
        demoMode={demoMode}
        initialEditOpen={initialEditOpen && selectedPerson?.id === initialPersonId}
      />

      <Sheet open={createOpen} onOpenChange={setCreateOpen}>
        <SheetContent
          side="right"
          className="w-full overflow-y-auto border-primary/20 sm:max-w-2xl"
        >
          <SheetHeader>
            <SheetTitle>Nueva ficha de staff</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <SportPersonForm
              clubId={clubId}
              teams={teams}
              onSaved={handlePersonSaved}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
