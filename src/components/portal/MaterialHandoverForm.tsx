'use client';

import { useEffect, useMemo, useState } from 'react';
import { useFormState } from 'react-dom';
import {
  createMaterialHandover,
  type MaterialActionState,
} from '@/app/actions/club-material';
import { SynqSelect } from '@/components/portal/SynqSelect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  MATERIAL_UNIT_LABELS,
  currentSeasonLabel,
  formatMaterialMoney,
  todayDateInputValue,
  materialHandoverRoleOptions,
  type MaterialHandoverItem,
  type MaterialHandoverRole,
  type MaterialLocationType,
} from '@/lib/club-material';
import { cn } from '@/lib/utils';

const initial: MaterialActionState = { ok: false };

type Props = {
  locationType: MaterialLocationType;
  locationId: string | null;
  locationLabel: string;
  items: MaterialHandoverItem[];
  onCreated?: (handoverId: string) => void;
};

export function MaterialHandoverForm({
  locationType,
  locationId,
  locationLabel,
  items,
  onCreated,
}: Props) {
  const [state, action, pending] = useFormState(createMaterialHandover, initial);
  const [role, setRole] = useState<MaterialHandoverRole>('coach');
  const itemsJson = useMemo(() => JSON.stringify(items), [items]);

  useEffect(() => {
    if (state.ok && state.handoverId) onCreated?.(state.handoverId);
  }, [state.ok, state.handoverId, onCreated]);

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay material asignado en esta zona para generar un recibí.
      </p>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="locationType" value={locationType} readOnly />
      <input type="hidden" name="locationId" value={locationId ?? ''} readOnly />
      <input type="hidden" name="locationLabel" value={locationLabel} readOnly />
      <input type="hidden" name="itemsJson" value={itemsJson} readOnly />
      <input type="hidden" name="recipientRole" value={role} readOnly />

      <div className="portal-section-surface rounded-xl p-4">
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Recibí de entrega — {locationLabel}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Documento de entrega de material al inicio de temporada.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Temporada
            </label>
            <Input
              name="season"
              defaultValue={currentSeasonLabel()}
              required
              placeholder="2025-26"
              className="border-primary/30 bg-background/80"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Fecha de entrega
            </label>
            <Input
              name="handedAt"
              type="date"
              defaultValue={todayDateInputValue()}
              required
              className="border-primary/30 bg-background/80"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Rol del responsable
            </label>
            <SynqSelect
              value={role}
              onChange={(value) => setRole(value as MaterialHandoverRole)}
              options={materialHandoverRoleOptions()}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Nombre del responsable
            </label>
            <Input
              name="recipientName"
              required
              placeholder="Nombre y apellidos"
              className="border-primary/30 bg-background/80"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Observaciones
            </label>
            <textarea
              name="notes"
              rows={2}
              placeholder="Opcional: condición del material, incidencias…"
              className={cn(
                'flex w-full rounded-md border border-primary/30 bg-background/80 px-3 py-2 text-sm',
                'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary'
              )}
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-primary/15 bg-muted/5 p-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Material incluido en el recibí
        </p>
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.material_id}
              className="flex items-start justify-between gap-3 text-sm"
            >
              <div>
                <p className="font-medium text-foreground">{item.material_name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.quantity} {MATERIAL_UNIT_LABELS[item.unit].toLowerCase()}
                  {item.unit_cost != null
                    ? ` · ${formatMaterialMoney(item.unit_cost * item.quantity, item.currency_code ?? 'EUR')}`
                    : ''}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? 'Generando…' : 'Generar recibí'}
        </Button>
        {state.message === 'validation' ? (
          <p className="text-sm text-destructive">Completa temporada y responsable.</p>
        ) : null}
        {state.message === 'error' ? (
          <p className="text-sm text-destructive">No se pudo generar el recibí.</p>
        ) : null}
      </div>
    </form>
  );
}
