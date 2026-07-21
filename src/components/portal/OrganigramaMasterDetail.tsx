'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Pencil, Phone, User } from 'lucide-react';
import { OrganigramaChart } from '@/components/portal/OrganigramaChart';
import { OrganigramaEditorForm } from '@/components/portal/OrganigramaEditorForm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PortalSheetBody,
  PortalSheetContent,
  PortalSheetHeader,
} from '@/components/portal/PortalSheet';
import { Sheet, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { peopleById, type ClubPerson } from '@/lib/club-people';
import {
  findOrganigramaNodeView,
  type OrganigramaNode,
  type OrganigramaNodeView,
} from '@/lib/organigrama';

type Props = {
  clubId: string;
  nodes: OrganigramaNode[];
  viewNodes: OrganigramaNodeView[];
  people: ClubPerson[];
  initialNodeId?: string | null;
  initialEditOpen?: boolean;
  demoMode?: boolean;
};

export function OrganigramaMasterDetail({
  clubId,
  nodes,
  viewNodes,
  people,
  initialNodeId,
  initialEditOpen,
  demoMode,
}: Props) {
  const router = useRouter();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(initialNodeId ?? null);
  const [editOpen, setEditOpen] = useState(Boolean(initialEditOpen));

  const peopleMap = useMemo(() => peopleById(people), [people]);

  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return findOrganigramaNodeView(viewNodes, selectedNodeId);
  }, [selectedNodeId, viewNodes]);

  const assignedPerson = selectedNode?.personId
    ? peopleMap.get(selectedNode.personId)
    : undefined;

  useEffect(() => {
    if (initialNodeId) setSelectedNodeId(initialNodeId);
  }, [initialNodeId]);

  useEffect(() => {
    if (initialEditOpen) setEditOpen(true);
  }, [initialEditOpen]);

  const handleSelectNode = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    router.replace(`/portal/club/organigrama?node=${nodeId}`, { scroll: false });
  };

  const handleEditOpen = () => {
    setEditOpen(true);
    const query = selectedNodeId ? `?node=${selectedNodeId}&edit=1` : '?edit=1';
    router.replace(`/portal/club/organigrama${query}`, { scroll: false });
  };

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-3 lg:items-start">
        <div className="lg:col-span-2">
          <OrganigramaChart
            nodes={viewNodes}
            selectedNodeId={selectedNodeId}
            onSelectNode={handleSelectNode}
          />
          <p className="mt-3 text-xs text-muted-foreground">
            Pulsa un cargo del organigrama para ver su detalle. Usa Modificar para editar cargos y
            asignaciones.
          </p>
        </div>

        <Card className="flex min-h-[16rem] flex-col border border-primary/25 lg:sticky lg:top-[4.5rem]">
          <CardHeader className="flex flex-row items-start justify-between gap-2 pb-3">
            <div>
              <CardTitle className="text-base">Cargo seleccionado</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                Persona asignada y enlaces rápidos
              </p>
            </div>
            <Button type="button" size="sm" variant="outline" onClick={handleEditOpen}>
              <Pencil className="size-3.5" />
              Modificar
            </Button>
          </CardHeader>
          <CardContent className="min-h-0 flex-1 space-y-4 overflow-y-auto">
            {!selectedNode ? (
              <p className="text-sm text-muted-foreground">
                Selecciona un nodo del organigrama para ver quién ocupa el cargo.
              </p>
            ) : (
              <>
                <div>
                  <p className="text-lg font-semibold text-foreground">{selectedNode.role}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge variant={selectedNode.vacant ? 'outline' : 'secondary'} className="text-[10px]">
                      {selectedNode.vacant ? 'Vacante' : 'Ocupado'}
                    </Badge>
                  </div>
                </div>

                {assignedPerson ? (
                  <div className="space-y-3 rounded-xl border border-primary/15 bg-muted/5 p-4">
                    <div className="flex items-center gap-2">
                      <User className="size-4 text-primary/70" />
                      <p className="font-medium text-foreground">{assignedPerson.full_name}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {assignedPerson.institutional_role || assignedPerson.sport_role || '—'}
                    </p>
                    {assignedPerson.email ? (
                      <p className="flex items-center gap-2 text-sm text-foreground">
                        <Mail className="size-3.5 text-muted-foreground" />
                        {assignedPerson.email}
                      </p>
                    ) : null}
                    {assignedPerson.phone ? (
                      <p className="flex items-center gap-2 text-sm text-foreground">
                        <Phone className="size-3.5 text-muted-foreground" />
                        {assignedPerson.phone}
                      </p>
                    ) : null}
                    {assignedPerson.person_kind !== 'sport' ? (
                      <Button size="sm" variant="outline" className="w-full" asChild>
                        <Link href={`/portal/club/estructura?person=${assignedPerson.id}`}>
                          Ver ficha institucional
                        </Link>
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" className="w-full" asChild>
                        <Link href={`/portal/club/staff?person=${assignedPerson.id}`}>
                          Ver ficha de staff
                        </Link>
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="rounded-lg border border-dashed border-primary/20 p-3 text-sm text-muted-foreground">
                    {selectedNode.personId
                      ? 'La persona asignada ya no existe en el club. Edita el organigrama para reasignar.'
                      : 'Cargo vacante. Abre Modificar para asignar una persona del club.'}
                  </p>
                )}
              </>
            )}

            {demoMode ? (
              <p className="rounded-lg border border-primary/20 bg-muted/10 p-3 text-xs text-muted-foreground">
                Organigrama de demostración. Los cambios no se guardan hasta conectar la base de
                datos del club.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <PortalSheetContent maxWidth="2xl">
          <PortalSheetHeader>
            <SheetHeader className="space-y-2 text-left">
              <SheetTitle className="text-xl tracking-tight">Modificar organigrama</SheetTitle>
            </SheetHeader>
          </PortalSheetHeader>
          <PortalSheetBody>
            <OrganigramaEditorForm
              clubId={clubId}
              nodes={nodes}
              people={people}
              onSaved={() => {
                setEditOpen(false);
                router.replace(
                  selectedNodeId
                    ? `/portal/club/organigrama?node=${selectedNodeId}`
                    : '/portal/club/organigrama',
                  { scroll: false }
                );
                router.refresh();
              }}
            />
          </PortalSheetBody>
        </PortalSheetContent>
      </Sheet>
    </>
  );
}
