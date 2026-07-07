'use client';

import { useEffect, useMemo, useState } from 'react';
import { useFormState } from 'react-dom';
import { upsertMaterialStock, type MaterialActionState } from '@/app/actions/club-material';
import { SynqSelect } from '@/components/portal/SynqSelect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  MATERIAL_UNIT_LABELS,
  type ClubMaterialItem,
  type ClubMaterialStock,
  type MaterialLocationType,
} from '@/lib/club-material';
import type { ClubFacility } from '@/lib/club-facilities';
import type { TeamOption } from '@/lib/person-assignments';

const initial: MaterialActionState = { ok: false };

type Props = {
  material: ClubMaterialItem;
  stock?: ClubMaterialStock | null;
  teams: TeamOption[];
  facilities: ClubFacility[];
  onSaved?: () => void;
};

export function MaterialStockForm({
  material,
  stock,
  teams,
  facilities,
  onSaved,
}: Props) {
  const [state, action, pending] = useFormState(upsertMaterialStock, initial);
  const [locationType, setLocationType] = useState<MaterialLocationType>(
    stock?.location_type ?? 'club'
  );
  const [locationId, setLocationId] = useState(stock?.location_id ?? '');

  const locationOptions = useMemo(() => {
    if (locationType === 'team') {
      return teams.map((team) => ({
        value: team.id,
        label: `${team.name} · ${team.category}`,
      }));
    }
    if (locationType === 'facility') {
      return facilities
        .filter((facility) => facility.active)
        .map((facility) => ({ value: facility.id, label: facility.name }));
    }
    return [];
  }, [locationType, teams, facilities]);

  useEffect(() => {
    if (state.ok) onSaved?.();
  }, [state.ok, onSaved]);

  useEffect(() => {
    if (locationType === 'club') {
      setLocationId('');
      return;
    }
    if (!locationId && locationOptions[0]) {
      setLocationId(locationOptions[0].value);
    }
  }, [locationType, locationId, locationOptions]);

  return (
    <form action={action} className="space-y-4">
      {stock ? <input type="hidden" name="stockId" value={stock.id} readOnly /> : null}
      <input type="hidden" name="materialId" value={material.id} readOnly />
      <input type="hidden" name="locationType" value={locationType} readOnly />
      {locationType !== 'club' ? (
        <input type="hidden" name="locationId" value={locationId} readOnly />
      ) : null}

      <p className="text-sm text-muted-foreground">
        Asignar stock de <span className="font-medium text-foreground">{material.name}</span> (
        {MATERIAL_UNIT_LABELS[material.unit].toLowerCase()}).
      </p>

      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Ubicación
        </label>
        <SynqSelect
          value={locationType}
          onChange={(value) => setLocationType(value as MaterialLocationType)}
          options={[
            { value: 'club', label: 'Almacén del club' },
            { value: 'team', label: 'Equipo' },
            { value: 'facility', label: 'Instalación' },
          ]}
        />
      </div>

      {locationType !== 'club' ? (
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {locationType === 'team' ? 'Equipo' : 'Instalación'}
          </label>
          <SynqSelect
            value={locationId}
            onChange={setLocationId}
            options={locationOptions}
            placeholder="Seleccionar destino"
          />
        </div>
      ) : null}

      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Cantidad
        </label>
        <Input
          name="quantity"
          type="number"
          min={0}
          step={1}
          defaultValue={stock?.quantity ?? 0}
          required
          className="border-primary/30 bg-background/80"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Notas
        </label>
        <Input
          name="notes"
          defaultValue={stock?.notes ?? ''}
          placeholder="Ubicación concreta, responsable…"
          className="border-primary/30 bg-background/80"
        />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? 'Guardando…' : stock ? 'Actualizar stock' : 'Añadir stock'}
      </Button>
    </form>
  );
}
