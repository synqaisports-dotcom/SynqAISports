'use client';

import { useEffect, useMemo, useState } from 'react';
import { useFormState } from 'react-dom';
import { Plus, Trash2 } from 'lucide-react';
import { updateOrganigrama, type OrganigramaState } from '@/app/actions/organigrama';
import { buildPersonSelectGroups, type ClubPerson } from '@/lib/club-people';
import {
  flattenOrganigrama,
  newOrganigramaNodeId,
  type OrganigramaNode,
  type OrganigramaNodeFlat,
} from '@/lib/organigrama';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SynqSelect } from '@/components/portal/SynqSelect';

const initial: OrganigramaState = { ok: false };

type Props = {
  clubId: string;
  nodes: OrganigramaNode[];
  people: ClubPerson[];
  onSaved?: () => void;
};

export function OrganigramaEditorForm({ clubId, nodes, people, onSaved }: Props) {
  const bound = updateOrganigrama.bind(null, clubId);
  const [state, action, pending] = useFormState(bound, initial);
  const [rows, setRows] = useState<OrganigramaNodeFlat[]>(() => flattenOrganigrama(nodes));

  const parentOptions = useMemo(
    () => rows.map((row) => ({ id: row.id, label: row.role })),
    [rows]
  );

  const personGroups = useMemo(() => buildPersonSelectGroups(people), [people]);

  useEffect(() => {
    if (state.ok) onSaved?.();
  }, [state.ok, onSaved]);

  const organigramaJson = JSON.stringify(
    rows.filter((row) => row.id.trim() && row.role.trim())
  );

  const updateRow = (id: string, patch: Partial<OrganigramaNodeFlat>) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const removeRow = (id: string) => {
    setRows((prev) => {
      const filtered = prev.filter((row) => row.id !== id);
      return filtered.map((row) => ({
        ...row,
        parentId: row.parentId === id ? null : row.parentId,
      }));
    });
  };

  const addRow = () => {
    const rootId = rows.find((r) => !r.parentId)?.id ?? null;
    setRows((prev) => [
      ...prev,
      {
        id: newOrganigramaNodeId(),
        role: 'Nuevo cargo',
        personId: null,
        parentId: rootId,
      },
    ]);
  };

  return (
    <form action={action} className="w-full space-y-6">
      <input type="hidden" name="organigramaJson" value={organigramaJson} readOnly />

      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
          <CardTitle className="text-base">Cargos y dependencias</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addRow}>
            <Plus className="size-4" />
            Añadir cargo
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {rows.map((row, index) => (
            <div
              key={row.id}
              className="grid w-full gap-3 rounded-xl border border-primary/20 bg-muted/10 p-4 md:grid-cols-12 md:items-end"
            >
              <div className="md:col-span-4">
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Cargo
                </label>
                <Input
                  value={row.role}
                  onChange={(e) => updateRow(row.id, { role: e.target.value })}
                  placeholder="Director de cantera"
                  className="w-full border-primary/30 bg-background/80 focus-visible:ring-primary"
                />
              </div>
              <div className="md:col-span-3">
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Persona
                </label>
                <SynqSelect
                  value={row.personId ?? ''}
                  onChange={(next) => updateRow(row.id, { personId: next || null })}
                  groups={personGroups}
                  placeholder="Vacante"
                />
              </div>
              <div className="md:col-span-4">
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Reporta a
                </label>
                <SynqSelect
                  value={row.parentId ?? ''}
                  onChange={(next) => updateRow(row.id, { parentId: next || null })}
                  disabled={index === 0 && !row.parentId}
                  placeholder="Raíz del organigrama"
                  options={[
                    { value: '', label: 'Raíz del organigrama' },
                    ...parentOptions
                      .filter((opt) => opt.id !== row.id)
                      .map((opt) => ({ value: opt.id, label: opt.label })),
                  ]}
                />
              </div>
              <div className="flex md:col-span-1 md:justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => removeRow(row.id)}
                  disabled={rows.length <= 1}
                  aria-label="Eliminar cargo"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-4 border-t border-primary/15 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? 'Guardando…' : 'Guardar organigrama'}
        </Button>
        {state.ok ? (
          <p className="text-sm font-medium text-primary">Organigrama guardado.</p>
        ) : null}
        {state.message === 'error' ? (
          <p className="text-sm text-destructive">Error al guardar. Revisa permisos RLS.</p>
        ) : null}
      </div>
    </form>
  );
}
