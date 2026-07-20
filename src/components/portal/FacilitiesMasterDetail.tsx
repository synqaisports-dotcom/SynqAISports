'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CalendarDays, MapPin, Pencil, Plus } from 'lucide-react';
import { FacilityDivisionOccupancy } from '@/components/portal/FacilityDivisionOccupancy';
import { FacilityForm } from '@/components/portal/FacilityForm';
import { FacilityPauseButton } from '@/components/portal/FacilityPauseButton';
import { FacilityReservationsPanel } from '@/components/portal/FacilityReservationsPanel';
import { SynqSelect } from '@/components/portal/SynqSelect';
import { PortalSearchField } from '@/components/portal/PortalSearchField';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  DIVISION_MODE_LABELS,
  FACILITY_KIND_LABELS,
  SPORT_LABELS,
  buildAvailabilityNote,
  facilityAllowsMatchVenue,
  facilityHasSharedDivisions,
  facilitySupportsDivisions,
  formatDivisionSchedule,
  formatFacilityAvailability,
  sportOptions,
  type ClubFacility,
  type ClubSport,
} from '@/lib/club-facilities';
import type { FacilityReservation } from '@/lib/facility-reservations';
import { buildFacilityDivisionSchedule, type TeamTrainingSlot } from '@/lib/team-setup';
import { cn } from '@/lib/utils';

type FacilityListSortMode = 'name-asc' | 'name-desc';

type SportFilter = 'all' | ClubSport;
type StatusFilter = 'all' | 'active' | 'paused';
type MatchVenueFilter = 'all' | 'yes' | 'no';

type Props = {
  facilities: ClubFacility[];
  trainingSlots: TeamTrainingSlot[];
  reservations: FacilityReservation[];
  initialFacilityId?: string | null;
  initialCreateOpen?: boolean;
  initialEditOpen?: boolean;
};

const actionButtonClass =
  'inline-flex size-9 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/10 hover:text-primary';

function compareFacilities(a: ClubFacility, b: ClubFacility, sort: FacilityListSortMode): number {
  const cmp = a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
  return sort === 'name-desc' ? -cmp : cmp;
}

function FacilityListIcon({ facility }: { facility: ClubFacility }) {
  return (
    <div
      className={cn(
        'relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-primary/25 bg-primary/5',
        !facility.active && 'opacity-70'
      )}
    >
      <MapPin className="size-4 text-primary/80" strokeWidth={1.5} />
    </div>
  );
}

function FacilityDataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-primary/10 pb-3 last:border-0 last:pb-0">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="text-right text-sm text-foreground">{value}</span>
    </div>
  );
}

function FacilityDetailPanel({
  facility,
  trainingSlots,
  reservations,
  initialEditOpen,
  onEdit,
}: {
  facility: ClubFacility | null;
  trainingSlots: TeamTrainingSlot[];
  reservations: FacilityReservation[];
  initialEditOpen?: boolean;
  onEdit: () => void;
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(Boolean(initialEditOpen));
  const sectionClass = 'rounded-xl border border-primary/15 bg-muted/5 p-4';

  useEffect(() => {
    setEditOpen(Boolean(initialEditOpen));
  }, [facility?.id, initialEditOpen]);

  const divisionSchedule = useMemo(() => {
    if (!facility || !facilityHasSharedDivisions(facility)) return [];
    return buildFacilityDivisionSchedule(facility, trainingSlots);
  }, [facility, trainingSlots]);

  if (!facility) {
    return (
      <Card className="flex h-full min-h-[28rem] flex-col border border-primary/25">
        <CardContent className="flex flex-1 items-center justify-center p-8">
          <p className="text-center text-sm text-muted-foreground">
            Selecciona una instalación para ver su ficha y ocupación por zonas.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'flex h-full min-h-[28rem] flex-col border border-primary/25',
        !facility.active && 'opacity-90'
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-lg font-semibold tracking-tight">{facility.name}</CardTitle>
              {!facility.active ? (
                <Badge variant="outline" className="text-[10px]">
                  Pausada
                </Badge>
              ) : null}
              {facility.is_match_venue ? (
                <Badge variant="secondary" className="text-[10px]">
                  Sede de partidos
                </Badge>
              ) : null}
              {facility.supports_reservations ? (
                <Badge variant="outline" className="border-primary/40 text-[10px] text-primary">
                  Reservas
                </Badge>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-primary">
              {SPORT_LABELS[facility.sport]} · {FACILITY_KIND_LABELS[facility.facility_kind]}
            </p>
            {facility.address ? (
              <p className="mt-0.5 text-xs text-muted-foreground">{facility.address}</p>
            ) : null}
          </div>
          <div className="flex shrink-0 flex-nowrap items-center gap-0.5">
            <button
              type="button"
              className={actionButtonClass}
              aria-label="Modificar instalación"
              title="Modificar instalación"
              onClick={() => {
                setEditOpen(true);
                onEdit();
              }}
            >
              <Pencil className="size-4" />
            </button>
            <Link
              href="/portal/cantera/horarios"
              className={actionButtonClass}
              aria-label="Ver horarios del club"
              title="Ver horarios del club"
            >
              <CalendarDays className="size-4" />
            </Link>
            <FacilityPauseButton facilityId={facility.id} active={facility.active} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="min-h-0 flex-1 space-y-4 overflow-y-auto">
        <section className={sectionClass}>
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Datos de la instalación
          </p>
          <div className="mt-3 space-y-3 text-sm">
            <FacilityDataRow label="Deporte / ámbito" value={SPORT_LABELS[facility.sport]} />
            <FacilityDataRow label="Tipo" value={FACILITY_KIND_LABELS[facility.facility_kind]} />
            <FacilityDataRow label="Superficie" value={facility.surface_type ?? '—'} />
            {facilitySupportsDivisions(facility.facility_kind) ? (
              <FacilityDataRow
                label="Modo división"
                value={DIVISION_MODE_LABELS[facility.division_mode]}
              />
            ) : null}
            <FacilityDataRow label="Dirección" value={facility.address ?? '—'} />
            {facilityAllowsMatchVenue(facility.facility_kind) ? (
              <FacilityDataRow
                label="Sede de partidos"
                value={facility.is_match_venue ? 'Sí' : 'No'}
              />
            ) : null}
            <FacilityDataRow
              label="Horario habitual"
              value={
                buildAvailabilityNote(
                  facility.availability_days,
                  facility.availability_start,
                  facility.availability_end
                ) ?? '—'
              }
            />
            {facilityHasSharedDivisions(facility) ? (
              <FacilityDataRow label="Horario de división" value={formatDivisionSchedule(facility)} />
            ) : null}
            <FacilityDataRow label="Resumen" value={formatFacilityAvailability(facility)} />
          </div>
          {facility.notes ? (
            <div className="mt-3 rounded-lg border border-primary/15 bg-muted/10 p-3 text-xs leading-relaxed text-muted-foreground">
              {facility.notes}
            </div>
          ) : null}
        </section>

        {facility.supports_reservations ? (
          <FacilityReservationsPanel facility={facility} reservations={reservations} />
        ) : null}

        <p className="rounded-lg border border-dashed border-primary/20 p-3 text-xs text-muted-foreground">
          {facility.supports_reservations
            ? 'Los socios y el staff podrán reservar franjas dentro del horario configurado.'
            : 'Los equipos de Cantera eligen esta instalación al configurar entrenamiento y sede de partidos.'}
        </p>

        {divisionSchedule.length > 0 ? (
          <FacilityDivisionOccupancy
            rows={divisionSchedule}
            title="Equipos por zona — días y horarios"
            className="border-0 shadow-none"
          />
        ) : null}
      </CardContent>

      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto border-primary/20 sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Modificar — {facility.name}</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <FacilityForm
              facility={facility}
              onSaved={() => {
                setEditOpen(false);
                router.replace(`/portal/club/instalaciones?facility=${facility.id}`, {
                  scroll: false,
                });
                router.refresh();
              }}
            />
          </div>
        </SheetContent>
      </Sheet>
    </Card>
  );
}

export function FacilitiesMasterDetail({
  facilities,
  trainingSlots,
  reservations,
  initialFacilityId,
  initialCreateOpen,
  initialEditOpen,
}: Props) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [sportFilter, setSportFilter] = useState<SportFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [matchVenueFilter, setMatchVenueFilter] = useState<MatchVenueFilter>('all');
  const [sortMode, setSortMode] = useState<FacilityListSortMode>('name-asc');
  const [createOpen, setCreateOpen] = useState(Boolean(initialCreateOpen));
  const [selectedId, setSelectedId] = useState<string | null>(
    initialFacilityId && facilities.some((facility) => facility.id === initialFacilityId)
      ? initialFacilityId
      : facilities[0]?.id ?? null
  );

  const filteredFacilities = useMemo(() => {
    const query = search.trim().toLowerCase();
    let list = [...facilities];

    if (sportFilter !== 'all') {
      list = list.filter((facility) => facility.sport === sportFilter);
    }

    if (statusFilter === 'active') {
      list = list.filter((facility) => facility.active);
    } else if (statusFilter === 'paused') {
      list = list.filter((facility) => !facility.active);
    }

    if (matchVenueFilter === 'yes') {
      list = list.filter((facility) => facility.is_match_venue);
    } else if (matchVenueFilter === 'no') {
      list = list.filter((facility) => !facility.is_match_venue);
    }

    if (query) {
      list = list.filter((facility) => {
        const haystack = [
          facility.name,
          facility.address,
          SPORT_LABELS[facility.sport],
          FACILITY_KIND_LABELS[facility.facility_kind],
          facility.surface_type,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(query);
      });
    }

    list.sort((a, b) => compareFacilities(a, b, sortMode));
    return list;
  }, [facilities, search, sportFilter, statusFilter, matchVenueFilter, sortMode]);

  const selectedFacility =
    facilities.find((facility) => facility.id === selectedId) ?? filteredFacilities[0] ?? null;

  useEffect(() => {
    if (initialFacilityId && facilities.some((facility) => facility.id === initialFacilityId)) {
      setSelectedId(initialFacilityId);
    }
  }, [initialFacilityId, facilities]);

  useEffect(() => {
    if (selectedId && !facilities.some((facility) => facility.id === selectedId)) {
      setSelectedId(facilities[0]?.id ?? null);
    }
  }, [facilities, selectedId]);

  useEffect(() => {
    if (initialCreateOpen) setCreateOpen(true);
  }, [initialCreateOpen]);

  const handleSelect = (facilityId: string) => {
    setSelectedId(facilityId);
    router.replace(`/portal/club/instalaciones?facility=${facilityId}`, { scroll: false });
  };

  const handleFacilitySaved = (facilityId: string) => {
    setCreateOpen(false);
    setSelectedId(facilityId);
    router.replace(`/portal/club/instalaciones?facility=${facilityId}`, { scroll: false });
    router.refresh();
  };

  const handleEditOpen = () => {
    if (!selectedFacility) return;
    router.replace(`/portal/club/instalaciones?facility=${selectedFacility.id}&edit=1`, {
      scroll: false,
    });
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
      <Card className="flex min-h-[28rem] flex-col border border-primary/25 lg:sticky lg:top-[4.5rem] lg:max-h-[calc(100vh-5.5rem)]">
        <CardHeader className="space-y-3 pb-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="text-base">Instalaciones</CardTitle>
              <CardDescription>
                {filteredFacilities.length} de {facilities.length} sedes
              </CardDescription>
            </div>
            <button
              type="button"
              className={actionButtonClass}
              aria-label="Nueva instalación"
              title="Nueva instalación"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="size-4" />
            </button>
          </div>
          <div className="space-y-2">
            <PortalSearchField
              value={search}
              onChange={setSearch}
              placeholder="Buscar por nombre, deporte o dirección…"
            />
            <div className="grid gap-2 sm:grid-cols-2">
              <SynqSelect
                value={sportFilter}
                onChange={(value) => setSportFilter(value as SportFilter)}
                options={[{ value: 'all', label: 'Todos los ámbitos' }, ...sportOptions()]}
                placeholder="Deporte / ámbito"
              />
              <SynqSelect
                value={statusFilter}
                onChange={(value) => setStatusFilter(value as StatusFilter)}
                options={[
                  { value: 'all', label: 'Activas y pausadas' },
                  { value: 'active', label: 'Solo activas' },
                  { value: 'paused', label: 'Solo pausadas' },
                ]}
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <SynqSelect
                value={matchVenueFilter}
                onChange={(value) => setMatchVenueFilter(value as MatchVenueFilter)}
                options={[
                  { value: 'all', label: 'Todas las sedes' },
                  { value: 'yes', label: 'Sede de partidos' },
                  { value: 'no', label: 'Sin sede oficial' },
                ]}
              />
              <SynqSelect
                value={sortMode}
                onChange={(value) => setSortMode(value as FacilityListSortMode)}
                options={[
                  { value: 'name-asc', label: 'A → Z (nombre)' },
                  { value: 'name-desc', label: 'Z → A (nombre)' },
                ]}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="min-h-0 flex-1 overflow-y-auto pt-0">
          {filteredFacilities.length === 0 ? (
            <p className="rounded-lg border border-dashed border-primary/20 px-4 py-8 text-center text-sm text-muted-foreground">
              {facilities.length === 0
                ? 'No hay instalaciones todavía. Pulsa + para crear la primera.'
                : 'No hay instalaciones con esos filtros.'}
            </p>
          ) : (
            <ul className="space-y-1.5">
              {filteredFacilities.map((facility) => {
                const active = selectedFacility?.id === facility.id;
                return (
                  <li key={facility.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(facility.id)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors',
                        active
                          ? 'border-primary/50 bg-primary/10 shadow-[inset_2px_0_0_0_hsl(var(--primary))]'
                          : 'border-primary/15 hover:border-primary/30 hover:bg-muted/20'
                      )}
                    >
                      <FacilityListIcon facility={facility} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="truncate text-sm font-medium text-foreground">
                            {facility.name}
                          </span>
                          {!facility.active ? (
                            <Badge variant="outline" className="text-[9px]">
                              Pausada
                            </Badge>
                          ) : null}
                          {facility.is_match_venue ? (
                            <Badge variant="secondary" className="text-[9px]">
                              Sede
                            </Badge>
                          ) : null}
                          {facility.supports_reservations ? (
                            <Badge variant="outline" className="border-primary/40 text-[9px] text-primary">
                              Reservas
                            </Badge>
                          ) : null}
                        </div>
                        <p className="truncate text-xs text-muted-foreground">
                          {SPORT_LABELS[facility.sport]} ·{' '}
                          {FACILITY_KIND_LABELS[facility.facility_kind]}
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

      <FacilityDetailPanel
        facility={selectedFacility}
        trainingSlots={trainingSlots}
        reservations={reservations}
        initialEditOpen={initialEditOpen}
        onEdit={handleEditOpen}
      />

      <Sheet open={createOpen} onOpenChange={setCreateOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto border-primary/20 sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Nueva instalación</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <FacilityForm onSaved={handleFacilitySaved} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
