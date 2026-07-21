'use client';

import { useEffect, useState } from 'react';
import { useFormState } from 'react-dom';
import {
  createMaterial,
  updateMaterial,
  type MaterialActionState,
} from '@/app/actions/club-material';
import { SynqSelect } from '@/components/portal/SynqSelect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  materialCategoryOptions,
  materialCurrencyOptions,
  materialUnitOptions,
  type ClubMaterialItem,
  type MaterialCategory,
  type MaterialCurrency,
  type MaterialUnit,
} from '@/lib/club-material';
import { cn } from '@/lib/utils';

const initial: MaterialActionState = { ok: false };

const sectionClass = 'portal-section-surface rounded-xl p-4';

type Props = {
  material?: ClubMaterialItem | null;
  onSaved?: (materialId: string) => void;
};

export function MaterialForm({ material, onSaved }: Props) {
  const bound = material ? updateMaterial.bind(null, material.id) : createMaterial;
  const [state, action, pending] = useFormState(bound, initial);
  const [category, setCategory] = useState<MaterialCategory>(material?.category ?? 'cones');
  const [unit, setUnit] = useState<MaterialUnit>(material?.unit ?? 'unit');
  const [currencyCode, setCurrencyCode] = useState<MaterialCurrency>(
    material?.currency_code ?? 'EUR'
  );
  const [unitCost, setUnitCost] = useState(
    material?.unit_cost != null ? String(material.unit_cost) : ''
  );

  useEffect(() => {
    if (state.ok && state.materialId) onSaved?.(state.materialId);
  }, [state.ok, state.materialId, onSaved]);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="category" value={category} readOnly />
      <input type="hidden" name="unit" value={unit} readOnly />
      <input type="hidden" name="currencyCode" value={currencyCode} readOnly />
      <input type="hidden" name="unitCost" value={unitCost} readOnly />

      <div className={sectionClass}>
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Identificación
        </p>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Nombre
            </label>
            <Input
              name="name"
              defaultValue={material?.name ?? ''}
              required
              placeholder="Ej. Conos de entrenamiento"
              className="border-primary/30 bg-background/80"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Categoría
            </label>
            <SynqSelect
              value={category}
              onChange={(value) => setCategory(value as MaterialCategory)}
              options={materialCategoryOptions()}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Unidad de recuento
            </label>
            <SynqSelect
              value={unit}
              onChange={(value) => setUnit(value as MaterialUnit)}
              options={materialUnitOptions()}
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Referencia / SKU
            </label>
            <Input
              name="sku"
              defaultValue={material?.sku ?? ''}
              placeholder="CONE-ORANGE"
              className="border-primary/30 bg-background/80"
            />
          </div>
        </div>
      </div>

      <div className={sectionClass}>
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Coste por unidad
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Se usa para calcular el dinero inmovilizado en inventario por zona.
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Tipo de moneda
            </label>
            <SynqSelect
              value={currencyCode}
              onChange={(value) => setCurrencyCode(value as MaterialCurrency)}
              options={materialCurrencyOptions()}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Importe por unidad
            </label>
            <Input
              name="unitCostDisplay"
              value={unitCost}
              onChange={(event) => setUnitCost(event.target.value)}
              inputMode="decimal"
              placeholder="0,00"
              className="border-primary/30 bg-background/80"
            />
          </div>
        </div>
      </div>

      <div className={sectionClass}>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Notas
        </label>
        <textarea
          name="notes"
          defaultValue={material?.notes ?? ''}
          rows={3}
          placeholder="Talla, color, proveedor…"
          className={cn(
            'flex w-full rounded-md border border-primary/30 bg-background/80 px-3 py-2 text-sm',
            'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary'
          )}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? 'Guardando…' : material ? 'Guardar cambios' : 'Crear material'}
        </Button>
        {state.message === 'validation' ? (
          <p className="text-sm text-destructive">Revisa el nombre, la categoría y el coste.</p>
        ) : null}
        {state.message === 'error' ? (
          <p className="text-sm text-destructive">Error al guardar. Revisa permisos RLS.</p>
        ) : null}
      </div>
    </form>
  );
}
