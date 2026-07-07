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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  materialCategoryOptions,
  materialUnitOptions,
  type ClubMaterialItem,
  type MaterialCategory,
  type MaterialUnit,
} from '@/lib/club-material';
import { cn } from '@/lib/utils';

const initial: MaterialActionState = { ok: false };

type Props = {
  material?: ClubMaterialItem | null;
  onSaved?: (materialId: string) => void;
};

export function MaterialForm({ material, onSaved }: Props) {
  const bound = material ? updateMaterial.bind(null, material.id) : createMaterial;
  const [state, action, pending] = useFormState(bound, initial);
  const [category, setCategory] = useState<MaterialCategory>(material?.category ?? 'cones');
  const [unit, setUnit] = useState<MaterialUnit>(material?.unit ?? 'unit');

  useEffect(() => {
    if (state.ok && state.materialId) onSaved?.(state.materialId);
  }, [state.ok, state.materialId, onSaved]);

  return (
    <form action={action} className="w-full space-y-6">
      <input type="hidden" name="category" value={category} readOnly />
      <input type="hidden" name="unit" value={unit} readOnly />

      <Card className="w-full border border-primary/25">
        <CardHeader>
          <CardTitle className="text-base">
            {material ? 'Modificar material' : 'Nuevo material'}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
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
          <div>
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
          <div className="md:col-span-2">
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
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={pending}>
          {pending ? 'Guardando…' : material ? 'Guardar cambios' : 'Crear material'}
        </Button>
        {state.message === 'validation' ? (
          <p className="text-sm text-destructive">Revisa el nombre y la categoría.</p>
        ) : null}
        {state.message === 'error' ? (
          <p className="text-sm text-destructive">Error al guardar. Revisa permisos RLS.</p>
        ) : null}
      </div>
    </form>
  );
}
