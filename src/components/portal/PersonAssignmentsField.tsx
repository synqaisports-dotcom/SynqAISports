'use client';

import { useEffect, useMemo, useState } from 'react';
import type { AccessProfile } from '@/lib/club-people';
import {
  assignmentModeForProfile,
  defaultAssignmentRoleForProfile,
  type PersonAssignment,
  type PersonAssignmentInput,
  type TeamOption,
  uniqueCategories,
} from '@/lib/person-assignments';
import { SynqMultiSelect } from '@/components/portal/SynqMultiSelect';
import { SynqSelect } from '@/components/portal/SynqSelect';

type Props = {
  accessProfile: AccessProfile;
  teams: TeamOption[];
  initialAssignments?: PersonAssignment[];
};

export function PersonAssignmentsField({
  accessProfile,
  teams,
  initialAssignments = [],
}: Props) {
  const mode = assignmentModeForProfile(accessProfile);
  const categories = useMemo(() => uniqueCategories(teams), [teams]);
  const teamOptions = useMemo(
    () => teams.map((team) => ({ value: team.id, label: `${team.name} (${team.category})` })),
    [teams]
  );

  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>(() =>
    initialAssignments.filter((row) => row.team_id).map((row) => row.team_id as string)
  );
  const [selectedCategory, setSelectedCategory] = useState(
    () => initialAssignments.find((row) => row.category)?.category ?? ''
  );

  useEffect(() => {
    setSelectedTeamIds(
      initialAssignments.filter((row) => row.team_id).map((row) => row.team_id as string)
    );
    setSelectedCategory(initialAssignments.find((row) => row.category)?.category ?? '');
  }, [initialAssignments, accessProfile]);

  const assignmentsJson = useMemo(() => {
    const role = defaultAssignmentRoleForProfile(accessProfile);
    const rows: PersonAssignmentInput[] = [];

    if (mode === 'teams') {
      for (const teamId of selectedTeamIds) {
        rows.push({ teamId, category: null, assignmentRole: role });
      }
    } else if (mode === 'category' && selectedCategory) {
      rows.push({ teamId: null, category: selectedCategory, assignmentRole: role });
    }

    return JSON.stringify(rows);
  }, [accessProfile, mode, selectedCategory, selectedTeamIds]);

  if (mode === 'none') {
    return (
      <div className="md:col-span-2">
        <input type="hidden" name="assignmentsJson" value="[]" readOnly />
        <p className="rounded-lg border border-primary/20 bg-muted/10 px-3 py-2 text-xs text-muted-foreground">
          Este perfil no requiere equipos asignados aquí. La relación con equipos se gestiona desde
          el organigrama o la ficha de equipo.
        </p>
      </div>
    );
  }

  if (mode === 'category') {
    return (
      <div className="md:col-span-2">
        <input type="hidden" name="assignmentsJson" value={assignmentsJson} readOnly />
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Etapa / categoría coordinada
        </label>
        <SynqSelect
          value={selectedCategory}
          onChange={setSelectedCategory}
          placeholder="Seleccionar categoría"
          options={[
            { value: '', label: 'Sin asignar' },
            ...categories.map((category) => ({ value: category, label: category })),
          ]}
        />
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          El coordinador de etapa supervisa todos los equipos de esa categoría (Sub-14, Sub-16…).
        </p>
      </div>
    );
  }

  return (
    <div className="md:col-span-2">
      <input type="hidden" name="assignmentsJson" value={assignmentsJson} readOnly />
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Equipos asignados
      </label>
      <SynqMultiSelect
        values={selectedTeamIds}
        onChange={setSelectedTeamIds}
        options={teamOptions}
        placeholder={teams.length > 0 ? 'Seleccionar uno o varios equipos' : 'Aún no hay equipos creados'}
        disabled={teams.length === 0}
      />
      <p className="mt-1.5 text-[11px] text-muted-foreground">
        Puedes asignar varios equipos. Cuando abramos la ficha de equipo verás entrenadores,
        delegados y preparadores vinculados aquí.
      </p>
      {teams.length === 0 ? (
        <p className="mt-1 text-[11px] text-muted-foreground">
          Crea equipos en Cantera → Equipos para poder asignarlos.
        </p>
      ) : null}
    </div>
  );
}
