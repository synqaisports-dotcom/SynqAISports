'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import type { ClubFacility } from '@/lib/club-facilities';
import {
  DIVISION_MODE_LABELS,
  SPORT_LABELS,
  TRAINING_DIVISION_LABELS,
  WEEKDAY_OPTIONS,
  divisionOptionsForFacility,
} from '@/lib/club-facilities';
import {
  DEFAULT_TEAM_SETUP,
  MATCH_VENUE_LABELS,
  TEAM_PURPOSE_LABELS,
  type TeamPurpose,
  type TeamSetupData,
  type TeamTrainingSlot,
  findTrainingConflicts,
} from '@/lib/team-setup';
import { SynqMultiSelect } from '@/components/portal/SynqMultiSelect';
import { SynqSelect } from '@/components/portal/SynqSelect';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type Props = {
  facilities: ClubFacility[];
  initial?: TeamSetupData;
  occupiedSlots?: TeamTrainingSlot[];
  excludeTeamId?: string;
  disabled?: boolean;
};

export function TeamSetupFields({
  facilities,
  initial = DEFAULT_TEAM_SETUP,
  occupiedSlots = [],
  excludeTeamId,
  disabled,
}: Props) {
  const [teamPurpose, setTeamPurpose] = useState<TeamPurpose>(initial.team_purpose);
  const [trainingFacilityId, setTrainingFacilityId] = useState(
    initial.training_facility_id ?? ''
  );
  const [trainingDivision, setTrainingDivision] = useState(
    initial.training_division ?? ''
  );
  const [trainingDays, setTrainingDays] = useState(
    initial.training_days
      ? initial.training_days.split(',').map((day) => day.trim()).filter(Boolean)
      : []
  );
  const [trainingStart, setTrainingStart] = useState(initial.training_start);
  const [trainingEnd, setTrainingEnd] = useState(initial.training_end);
  const [matchVenueType, setMatchVenueType] = useState(initial.match_venue_type);
  const [matchOwnSingleVenue, setMatchOwnSingleVenue] = useState(
    initial.match_own_single_venue
  );
  const [matchHomeMode, setMatchHomeMode] = useState(initial.match_home_mode);
  const [matchAwayMode, setMatchAwayMode] = useState(initial.match_away_mode);
  const [externalVenueName, setExternalVenueName] = useState(initial.external_venue_name);
  const [externalVenueAddress, setExternalVenueAddress] = useState(
    initial.external_venue_address
  );

  const selectedFacility = useMemo(
    () => facilities.find((facility) => facility.id === trainingFacilityId),
    [facilities, trainingFacilityId]
  );

  const divisionOptions = useMemo(
    () => divisionOptionsForFacility(selectedFacility),
    [selectedFacility]
  );

  const handleFacilityChange = (facilityId: string) => {
    setTrainingFacilityId(facilityId);
    const facility = facilities.find((item) => item.id === facilityId);
    const options = divisionOptionsForFacility(facility);
    if (!options.find((option) => option.value === trainingDivision)) {
      setTrainingDivision(options[0]?.value ?? '');
    }
  };

  const currentSetup: TeamSetupData = {
    team_purpose: teamPurpose,
    training_facility_id: trainingFacilityId || null,
    training_division: (trainingDivision || null) as TeamSetupData['training_division'],
    training_days: trainingDays.join(','),
    training_start: trainingStart,
    training_end: trainingEnd,
    match_venue_type: matchVenueType,
    match_own_single_venue: matchOwnSingleVenue,
    match_home_mode: matchHomeMode,
    match_away_mode: matchAwayMode,
    external_venue_name: externalVenueName,
    external_venue_address: externalVenueAddress,
  };

  const conflicts = useMemo(
    () =>
      findTrainingConflicts(
        currentSetup,
        selectedFacility,
        occupiedSlots,
        excludeTeamId
      ),
    [currentSetup, selectedFacility, occupiedSlots, excludeTeamId]
  );

  const facilityOptions = facilities.map((facility) => ({
    value: facility.id,
    label: `${facility.name} (${SPORT_LABELS[facility.sport]})`,
  }));

  return (
    <>
      <input type="hidden" name="teamPurpose" value={teamPurpose} readOnly />
      <input type="hidden" name="trainingFacilityId" value={trainingFacilityId} readOnly />
      <input type="hidden" name="trainingDivision" value={trainingDivision} readOnly />
      <input type="hidden" name="trainingDays" value={trainingDays.join(',')} readOnly />
      <input type="hidden" name="matchVenueType" value={matchVenueType} readOnly />

      <Card className="w-full border border-primary/25">
        <CardHeader>
          <CardTitle className="text-base">Entrenamiento y tipo de equipo</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Tipo de equipo
            </label>
            <SynqSelect
              value={teamPurpose}
              onChange={(value) => setTeamPurpose(value as TeamPurpose)}
              options={[
                { value: 'competition', label: TEAM_PURPOSE_LABELS.competition },
                { value: 'formation', label: TEAM_PURPOSE_LABELS.formation },
              ]}
              disabled={disabled}
            />
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              Competición para ligas y torneos; formación para escuela y desarrollo.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Instalación de entrenamiento
            </label>
            {facilityOptions.length > 0 ? (
              <SynqSelect
                value={trainingFacilityId}
                onChange={handleFacilityChange}
                options={facilityOptions}
                placeholder="Seleccionar instalación"
                disabled={disabled}
              />
            ) : (
              <p className="rounded-md border border-dashed border-primary/25 px-3 py-2 text-sm text-muted-foreground">
                No hay instalaciones registradas. Configúralas en Club → Instalaciones.
              </p>
            )}
            {selectedFacility ? (
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                {DIVISION_MODE_LABELS[selectedFacility.division_mode]}
                {selectedFacility.address ? ` · ${selectedFacility.address}` : ''}
              </p>
            ) : null}
          </div>

          {selectedFacility && divisionOptions.length > 0 ? (
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Zona del campo
              </label>
              <SynqSelect
                value={trainingDivision}
                onChange={setTrainingDivision}
                options={divisionOptions}
                placeholder="Seleccionar zona"
                disabled={disabled}
              />
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                En campos compartidos (2 mitades o 4 cuartos) cada equipo ocupa una zona.
              </p>
            </div>
          ) : null}

          <div className={selectedFacility && divisionOptions.length > 0 ? '' : 'md:col-span-2'}>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Días de entrenamiento
            </label>
            <SynqMultiSelect
              values={trainingDays}
              onChange={setTrainingDays}
              options={WEEKDAY_OPTIONS}
              placeholder="Seleccionar días"
              disabled={disabled}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Hora inicio
            </label>
            <Input
              type="time"
              name="trainingStart"
              value={trainingStart}
              onChange={(event) => setTrainingStart(event.target.value)}
              disabled={disabled}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Hora fin
            </label>
            <Input
              type="time"
              name="trainingEnd"
              value={trainingEnd}
              onChange={(event) => setTrainingEnd(event.target.value)}
              disabled={disabled}
            />
          </div>

          {conflicts.length > 0 ? (
            <div className="md:col-span-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-100">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-400" />
                <div>
                  <p className="font-medium text-amber-50">
                    Posible solapamiento en la instalación
                  </p>
                  <ul className="mt-1.5 space-y-1 text-xs text-amber-100/90">
                    {conflicts.map((slot) => (
                      <li key={slot.teamId}>
                        {slot.teamName}
                        {slot.training_division
                          ? ` (${TRAINING_DIVISION_LABELS[slot.training_division]})`
                          : ''}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-[11px] text-amber-100/80">
                    Revisa horarios y zonas del campo antes de guardar. Más adelante bloquearemos
                    automáticamente los cruces en instalaciones compartidas.
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="w-full border border-primary/25">
        <CardHeader>
          <CardTitle className="text-base">Sede de partidos</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Origen de la sede
            </label>
            <SynqSelect
              value={matchVenueType}
              onChange={(value) =>
                setMatchVenueType(value === 'external' ? 'external' : 'own')
              }
              options={[
                { value: 'own', label: MATCH_VENUE_LABELS.own },
                { value: 'external', label: MATCH_VENUE_LABELS.external },
              ]}
              disabled={disabled}
            />
          </div>

          {matchVenueType === 'own' ? (
            <>
              <div className="md:col-span-2">
                <label
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-lg border border-primary/20 p-3 transition-colors',
                    matchOwnSingleVenue && 'border-primary/40 bg-primary/5',
                    disabled && 'cursor-not-allowed opacity-60'
                  )}
                >
                  <input
                    type="checkbox"
                    name="matchOwnSingleVenue"
                    checked={matchOwnSingleVenue}
                    onChange={(event) => setMatchOwnSingleVenue(event.target.checked)}
                    disabled={disabled}
                    className="mt-0.5 size-4 rounded border-primary/40 accent-primary"
                  />
                  <span>
                    <span className="block text-sm font-medium text-foreground">
                      Sede única
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      El equipo juega siempre en la misma instalación del club.
                    </span>
                  </span>
                </label>
              </div>

              {!matchOwnSingleVenue ? (
                <>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Modo partidos — local
                    </label>
                    <Input
                      name="matchHomeMode"
                      value={matchHomeMode}
                      onChange={(event) => setMatchHomeMode(event.target.value)}
                      placeholder="Ej. Campo principal, pabellón A…"
                      disabled={disabled}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Modo partidos — visitante
                    </label>
                    <Input
                      name="matchAwayMode"
                      value={matchAwayMode}
                      onChange={(event) => setMatchAwayMode(event.target.value)}
                      placeholder="Ej. Desplazamientos en comarca…"
                      disabled={disabled}
                    />
                  </div>
                </>
              ) : null}
            </>
          ) : (
            <>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Nombre de la sede
                </label>
                <Input
                  name="externalVenueName"
                  value={externalVenueName}
                  onChange={(event) => setExternalVenueName(event.target.value)}
                  placeholder="Ej. Municipal La Vega"
                  disabled={disabled}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Dirección
                </label>
                <Input
                  name="externalVenueAddress"
                  value={externalVenueAddress}
                  onChange={(event) => setExternalVenueAddress(event.target.value)}
                  placeholder="Calle, número, ciudad"
                  disabled={disabled}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
