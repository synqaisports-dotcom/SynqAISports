'use client';

import { useEffect, useMemo, useState } from 'react';
import { useFormState } from 'react-dom';
import { useRouter } from 'next/navigation';
import {
  createFacility,
  updateFacility,
  type FacilityActionState,
} from '@/app/actions/club-facilities';
import {
  DIVISION_MODE_LABELS,
  type ClubFacility,
  type ClubSport,
  type FacilityDivisionMode,
  type FacilityKind,
  defaultDivisionModeForKind,
  facilityHasSharedDivisions,
  facilityKindOptions,
  facilitySupportsDivisions,
  sportOptions,
  surfaceOptionsForKind,
} from '@/lib/club-facilities';
import { ScheduleBlockFields } from '@/components/portal/ScheduleBlockFields';
import { SynqSelect } from '@/components/portal/SynqSelect';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const initial: FacilityActionState = { ok: false };

function parseDays(value: string | undefined) {
  return value ? value.split(',').map((day) => day.trim()).filter(Boolean) : [];
}

type Props = {
  facility?: ClubFacility | null;
};

export function FacilityForm({ facility }: Props) {
  const router = useRouter();
  const bound = facility
    ? updateFacility.bind(null, facility.id)
    : createFacility;
  const [state, action, pending] = useFormState(bound, initial);

  const [sport, setSport] = useState<ClubSport>(facility?.sport ?? 'football');
  const [facilityKind, setFacilityKind] = useState<FacilityKind>(
    facility?.facility_kind ?? 'football_11'
  );
  const [divisionMode, setDivisionMode] = useState<FacilityDivisionMode>(
    facility?.division_mode ?? 'quarters_4'
  );
  const [surfaceType, setSurfaceType] = useState(facility?.surface_type ?? '');
  const [availabilityDays, setAvailabilityDays] = useState(
    parseDays(facility?.availability_days)
  );
  const [availabilityStart, setAvailabilityStart] = useState(facility?.availability_start ?? '');
  const [availabilityEnd, setAvailabilityEnd] = useState(facility?.availability_end ?? '');
  const [divisionScheduleDays, setDivisionScheduleDays] = useState(
    parseDays(facility?.division_schedule_days)
  );
  const [divisionScheduleStart, setDivisionScheduleStart] = useState(
    facility?.division_schedule_start ?? ''
  );
  const [divisionScheduleEnd, setDivisionScheduleEnd] = useState(
    facility?.division_schedule_end ?? ''
  );
  const [isMatchVenue, setIsMatchVenue] = useState(facility?.is_match_venue ?? false);

  const kindOptions = useMemo(() => facilityKindOptions(sport), [sport]);
  const surfaceOptions = useMemo(() => surfaceOptionsForKind(facilityKind), [facilityKind]);
  const showDivisionType = facilitySupportsDivisions(facilityKind);

  const draftFacility = useMemo(
    (): ClubFacility => ({
      id: facility?.id ?? 'draft',
      name: facility?.name ?? '',
      sport,
      facility_kind: facilityKind,
      surface_type: surfaceType || null,
      division_mode: showDivisionType ? divisionMode : 'full',
      address: facility?.address ?? null,
      availability_days: availabilityDays.join(','),
      availability_start: availabilityStart,
      availability_end: availabilityEnd,
      division_schedule_days: divisionScheduleDays.join(','),
      division_schedule_start: divisionScheduleStart,
      division_schedule_end: divisionScheduleEnd,
      is_match_venue: isMatchVenue,
      availability_note: null,
      notes: facility?.notes ?? null,
      active: true,
    }),
    [
      facility,
      sport,
      facilityKind,
      surfaceType,
      divisionMode,
      showDivisionType,
      availabilityDays,
      availabilityStart,
      availabilityEnd,
      divisionScheduleDays,
      divisionScheduleStart,
      divisionScheduleEnd,
      isMatchVenue,
    ]
  );

  const showDivisionSchedule = facilityHasSharedDivisions(draftFacility);

  useEffect(() => {
    if (state.ok) {
      const target = state.facilityId ?? facility?.id;
      router.push(target ? `/portal/club/instalaciones/${target}` : '/portal/club/instalaciones');
      router.refresh();
    }
  }, [state.ok, state.facilityId, facility?.id, router]);

  const handleSportChange = (value: string) => {
    const nextSport = value as ClubSport;
    setSport(nextSport);
    const kinds = facilityKindOptions(nextSport);
    if (!kinds.find((option) => option.value === facilityKind)) {
      const nextKind = kinds[0]?.value ?? 'other';
      setFacilityKind(nextKind);
      setDivisionMode(defaultDivisionModeForKind(nextKind));
    }
  };

  const handleKindChange = (value: string) => {
    const nextKind = value as FacilityKind;
    setFacilityKind(nextKind);
    if (!facilitySupportsDivisions(nextKind)) {
      setDivisionMode('full');
      setDivisionScheduleDays([]);
      setDivisionScheduleStart('');
      setDivisionScheduleEnd('');
    } else if (!facilitySupportsDivisions(facilityKind)) {
      setDivisionMode(defaultDivisionModeForKind(nextKind));
    }
    const surfaces = surfaceOptionsForKind(nextKind);
    if (!surfaces.find((option) => option.value === surfaceType)) {
      setSurfaceType(surfaces[0]?.value ?? '');
    }
  };

  const handleDivisionModeChange = (value: string) => {
    const nextMode = value as FacilityDivisionMode;
    setDivisionMode(nextMode);
    if (nextMode === 'full') {
      setDivisionScheduleDays([]);
      setDivisionScheduleStart('');
      setDivisionScheduleEnd('');
    }
  };

  return (
    <form action={action} className="w-full space-y-6">
      <input type="hidden" name="sport" value={sport} readOnly />
      <input type="hidden" name="facilityKind" value={facilityKind} readOnly />
      <input type="hidden" name="divisionMode" value={divisionMode} readOnly />
      <input type="hidden" name="surfaceType" value={surfaceType} readOnly />

      <Card className="w-full border border-primary/25">
        <CardHeader>
          <CardTitle className="text-base">
            {facility ? 'Modificar instalación' : 'Nueva instalación'}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Nombre
            </label>
            <Input
              name="name"
              defaultValue={facility?.name ?? ''}
              required
              placeholder="Ej. Campo principal F-11"
              className="border-primary/30 bg-background/80"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Deporte
            </label>
            <SynqSelect
              value={sport}
              onChange={handleSportChange}
              options={sportOptions()}
              placeholder="Seleccionar deporte"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Tipo de instalación
            </label>
            <SynqSelect
              value={facilityKind}
              onChange={handleKindChange}
              options={kindOptions}
              placeholder="Seleccionar tipo"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Superficie / pavimento
            </label>
            <SynqSelect
              value={surfaceType}
              onChange={setSurfaceType}
              options={surfaceOptions}
              placeholder="Seleccionar superficie"
            />
          </div>

          {showDivisionType ? (
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Modo de división del campo
              </label>
              <SynqSelect
                value={divisionMode}
                onChange={handleDivisionModeChange}
                options={[
                  { value: 'full', label: DIVISION_MODE_LABELS.full },
                  { value: 'halves_2', label: DIVISION_MODE_LABELS.halves_2 },
                  { value: 'quarters_4', label: DIVISION_MODE_LABELS.quarters_4 },
                ]}
              />
            </div>
          ) : null}

          <div className={showDivisionType ? '' : 'md:col-span-2'}>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Dirección o ubicación
            </label>
            <Input
              name="address"
              defaultValue={facility?.address ?? ''}
              placeholder="Polideportivo municipal, acceso norte…"
              className="border-primary/30 bg-background/80"
            />
          </div>

          <div className="md:col-span-2">
            <label
              className={cn(
                'flex cursor-pointer items-start gap-3 rounded-lg border border-primary/20 p-3 transition-colors',
                isMatchVenue && 'border-primary/40 bg-primary/5'
              )}
            >
              <input
                type="checkbox"
                name="isMatchVenue"
                checked={isMatchVenue}
                onChange={(event) => setIsMatchVenue(event.target.checked)}
                className="mt-0.5 size-4 rounded border-primary/40 accent-primary"
              />
              <span>
                <span className="block text-sm font-medium text-foreground">
                  Sede de partidos del club
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  Marca si esta instalación puede usarse como sede oficial para jugar partidos.
                </span>
              </span>
            </label>
          </div>

          <div className="md:col-span-2">
            <ScheduleBlockFields
              title="Horario habitual del campo"
              hint="Días y franja en los que la instalación está disponible en general (L · M · X · J · V · S · D)."
              days={availabilityDays}
              onDaysChange={setAvailabilityDays}
              start={availabilityStart}
              end={availabilityEnd}
              onStartChange={setAvailabilityStart}
              onEndChange={setAvailabilityEnd}
              daysFieldName="availabilityDays"
              startFieldName="availabilityStart"
              endFieldName="availabilityEnd"
            />
          </div>

          {showDivisionSchedule ? (
            <div className="md:col-span-2">
              <ScheduleBlockFields
                title={`Horario de división — ${DIVISION_MODE_LABELS[divisionMode]}`}
                hint="Días y franja en los que el campo se comparte en zonas (mitades o cuartos). Suele ser un subconjunto del horario habitual."
                days={divisionScheduleDays}
                onDaysChange={setDivisionScheduleDays}
                start={divisionScheduleStart}
                end={divisionScheduleEnd}
                onStartChange={setDivisionScheduleStart}
                onEndChange={setDivisionScheduleEnd}
                daysFieldName="divisionScheduleDays"
                startFieldName="divisionScheduleStart"
                endFieldName="divisionScheduleEnd"
                className="border-primary/35 bg-primary/5"
              />
            </div>
          ) : null}

          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Notas internas
            </label>
            <textarea
              name="notes"
              defaultValue={facility?.notes ?? ''}
              rows={3}
              placeholder="Compartido con escuela, acceso por puerta lateral…"
              className={cn(
                'flex w-full rounded-md border border-primary/30 bg-background/80 px-3 py-2 text-sm',
                'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary'
              )}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={pending}>
          {pending ? 'Guardando…' : facility ? 'Guardar cambios' : 'Crear instalación'}
        </Button>
        {state.ok ? (
          <p className="text-sm font-medium text-primary">Instalación guardada.</p>
        ) : null}
        {state.message === 'validation' ? (
          <p className="text-sm text-destructive">Revisa el nombre de la instalación.</p>
        ) : null}
        {state.message === 'error' ? (
          <p className="text-sm text-destructive">Error al guardar. Revisa permisos RLS.</p>
        ) : null}
      </div>
    </form>
  );
}
