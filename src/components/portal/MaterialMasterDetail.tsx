'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Layers,
  MapPin,
  Package,
  Pencil,
  Plus,
  Warehouse,
} from 'lucide-react';
import { MaterialForm } from '@/components/portal/MaterialForm';
import { MaterialPauseButton } from '@/components/portal/MaterialPauseButton';
import { MaterialStockForm } from '@/components/portal/MaterialStockForm';
import { PortalSearchField } from '@/components/portal/PortalSearchField';
import { SynqSelect } from '@/components/portal/SynqSelect';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type { ClubFacility } from '@/lib/club-facilities';
import {
  MATERIAL_CATEGORY_LABELS,
  MATERIAL_UNIT_LABELS,
  locationLabel,
  stockByLocation,
  stockForMaterial,
  totalQuantityForMaterial,
  type ClubMaterialItem,
  type ClubMaterialStock,
} from '@/lib/club-material';
import type { TeamOption } from '@/lib/person-assignments';
import { cn } from '@/lib/utils';

export type MaterialViewMode = 'catalog' | 'team' | 'facility';

type MaterialListSortMode = 'name-asc' | 'name-desc';

type Props = {
  materials: ClubMaterialItem[];
  stock: ClubMaterialStock[];
  teams: TeamOption[];
  facilities: ClubFacility[];
  initialView?: MaterialViewMode;
  initialMaterialId?: string | null;
  initialTeamId?: string | null;
  initialFacilityId?: string | null;
  initialCreateOpen?: boolean;
  initialEditOpen?: boolean;
};

const actionButtonClass =
  'inline-flex size-9 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/10 hover:text-primary';

function compareMaterials(a: ClubMaterialItem, b: ClubMaterialItem, sort: MaterialListSortMode) {
  const cmp = a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
  return sort === 'name-desc' ? -cmp : cmp;
}

function MaterialListIcon() {
  return (
    <div className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-primary/25 bg-primary/5">
      <Package className="size-4 text-primary/80" strokeWidth={1.5} />
    </div>
  );
}

function StockTable({
  rows,
  unitLabel,
}: {
  rows: Array<{
    stockId: string;
    material: ClubMaterialItem;
    quantity: number;
    notes: string | null;
  }>;
  unitLabel?: string;
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">Sin material asignado.</p>;
  }

  return (
    <ul className="space-y-2">
      {rows.map((row) => (
        <li
          key={row.stockId}
          className="flex items-start justify-between gap-3 rounded-lg border border-primary/15 bg-background/40 px-3 py-2"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">{row.material.name}</p>
            <p className="text-xs text-muted-foreground">
              {MATERIAL_CATEGORY_LABELS[row.material.category]}
              {row.notes ? ` · ${row.notes}` : ''}
            </p>
          </div>
          <p className="shrink-0 text-sm font-semibold text-primary">
            {row.quantity}{' '}
            <span className="text-xs font-normal text-muted-foreground">
              {unitLabel ?? MATERIAL_UNIT_LABELS[row.material.unit].toLowerCase()}
            </span>
          </p>
        </li>
      ))}
    </ul>
  );
}

function CatalogDetailPanel({
  material,
  stock,
  teams,
  facilities,
  initialEditOpen,
  onAddStock,
}: {
  material: ClubMaterialItem | null;
  stock: ClubMaterialStock[];
  teams: TeamOption[];
  facilities: ClubFacility[];
  initialEditOpen?: boolean;
  onAddStock: () => void;
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(Boolean(initialEditOpen));
  const [stockOpen, setStockOpen] = useState(false);
  const sectionClass = 'rounded-xl border border-primary/15 bg-muted/5 p-4';

  useEffect(() => {
    setEditOpen(Boolean(initialEditOpen));
  }, [material?.id, initialEditOpen]);

  const teamMap = useMemo(() => new Map(teams.map((team) => [team.id, team])), [teams]);
  const facilityMap = useMemo(
    () => new Map(facilities.map((facility) => [facility.id, facility])),
    [facilities]
  );

  if (!material) {
    return (
      <Card className="flex h-full min-h-[28rem] flex-col border border-primary/25">
        <CardContent className="flex flex-1 items-center justify-center p-8">
          <p className="text-center text-sm text-muted-foreground">
            Selecciona un material para ver su inventario por ubicación.
          </p>
        </CardContent>
      </Card>
    );
  }

  const materialStock = stockForMaterial(material.id, stock);
  const total = totalQuantityForMaterial(material.id, stock);
  const byTeam = materialStock.filter((row) => row.location_type === 'team');
  const byFacility = materialStock.filter((row) => row.location_type === 'facility');
  const byClub = materialStock.filter((row) => row.location_type === 'club');

  return (
    <Card
      className={cn(
        'flex h-full min-h-[28rem] flex-col border border-primary/25',
        !material.active && 'opacity-90'
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-lg font-semibold tracking-tight">{material.name}</CardTitle>
              {!material.active ? (
                <Badge variant="outline" className="text-[10px]">
                  Pausado
                </Badge>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-primary">
              {MATERIAL_CATEGORY_LABELS[material.category]} ·{' '}
              {MATERIAL_UNIT_LABELS[material.unit]}
            </p>
            {material.sku ? (
              <p className="text-xs text-muted-foreground">Ref. {material.sku}</p>
            ) : null}
          </div>
          <div className="flex shrink-0 flex-nowrap items-center gap-0.5">
            <button
              type="button"
              className={actionButtonClass}
              aria-label="Modificar material"
              title="Modificar material"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="size-4" />
            </button>
            <button
              type="button"
              className={actionButtonClass}
              aria-label="Añadir stock"
              title="Añadir o mover stock"
              onClick={() => {
                setStockOpen(true);
                onAddStock();
              }}
            >
              <Plus className="size-4" />
            </button>
            <MaterialPauseButton materialId={material.id} active={material.active} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="min-h-0 flex-1 space-y-4 overflow-y-auto">
        <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Total en club
          </p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {total}{' '}
            <span className="text-sm font-normal text-muted-foreground">
              {MATERIAL_UNIT_LABELS[material.unit].toLowerCase()}
            </span>
          </p>
        </div>

        {material.notes ? (
          <p className="rounded-lg border border-primary/15 bg-muted/10 p-3 text-xs text-muted-foreground">
            {material.notes}
          </p>
        ) : null}

        <section className={sectionClass}>
          <div className="mb-2 flex items-center gap-2">
            <Warehouse className="size-4 text-primary/70" />
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Almacén central
            </p>
          </div>
          {byClub.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin stock en almacén.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {byClub.map((row) => (
                <li key={row.id} className="flex justify-between gap-2">
                  <span>{row.notes ?? 'Almacén del club'}</span>
                  <span className="font-medium">{row.quantity}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={sectionClass}>
          <div className="mb-2 flex items-center gap-2">
            <Layers className="size-4 text-primary/70" />
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Por equipo
            </p>
          </div>
          {byTeam.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin asignación a equipos.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {byTeam.map((row) => (
                <li key={row.id} className="flex justify-between gap-2">
                  <Link
                    href={`/portal/club/material?view=team&team=${row.location_id}`}
                    className="text-primary hover:underline"
                  >
                    {teamMap.get(row.location_id!)?.name ?? 'Equipo'}
                  </Link>
                  <span className="font-medium">{row.quantity}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={sectionClass}>
          <div className="mb-2 flex items-center gap-2">
            <MapPin className="size-4 text-primary/70" />
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Por instalación
            </p>
          </div>
          {byFacility.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin stock en instalaciones.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {byFacility.map((row) => (
                <li key={row.id} className="flex justify-between gap-2">
                  <Link
                    href={`/portal/club/material?view=facility&facility=${row.location_id}`}
                    className="text-primary hover:underline"
                  >
                    {facilityMap.get(row.location_id!)?.name ?? 'Instalación'}
                  </Link>
                  <span className="font-medium">{row.quantity}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </CardContent>

      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto border-primary/20 sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Modificar — {material.name}</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <MaterialForm
              material={material}
              onSaved={() => {
                setEditOpen(false);
                router.replace(`/portal/club/material?material=${material.id}`, { scroll: false });
                router.refresh();
              }}
            />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={stockOpen} onOpenChange={setStockOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto border-primary/20 sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Asignar stock</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <MaterialStockForm
              material={material}
              teams={teams}
              facilities={facilities}
              onSaved={() => {
                setStockOpen(false);
                router.refresh();
              }}
            />
          </div>
        </SheetContent>
      </Sheet>
    </Card>
  );
}

function LocationDetailPanel({
  title,
  subtitle,
  rows,
}: {
  title: string;
  subtitle: string;
  rows: ReturnType<typeof stockByLocation>;
}) {
  const totalUnits = rows.reduce((sum, row) => sum + row.quantity, 0);

  return (
    <Card className="flex h-full min-h-[28rem] flex-col border border-primary/25">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold tracking-tight">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 space-y-4 overflow-y-auto">
        <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Líneas de inventario
          </p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{rows.length}</p>
          <p className="text-xs text-muted-foreground">{totalUnits} unidades contabilizadas</p>
        </div>
        <StockTable rows={rows} />
      </CardContent>
    </Card>
  );
}

export function MaterialMasterDetail({
  materials,
  stock,
  teams,
  facilities,
  initialView = 'catalog',
  initialMaterialId,
  initialTeamId,
  initialFacilityId,
  initialCreateOpen,
  initialEditOpen,
}: Props) {
  const router = useRouter();
  const [view, setView] = useState<MaterialViewMode>(initialView);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortMode, setSortMode] = useState<MaterialListSortMode>('name-asc');
  const [createOpen, setCreateOpen] = useState(Boolean(initialCreateOpen));
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(
    initialMaterialId && materials.some((item) => item.id === initialMaterialId)
      ? initialMaterialId
      : materials[0]?.id ?? null
  );
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(
    initialTeamId && teams.some((team) => team.id === initialTeamId)
      ? initialTeamId
      : teams[0]?.id ?? null
  );
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(
    initialFacilityId && facilities.some((facility) => facility.id === initialFacilityId)
      ? initialFacilityId
      : facilities[0]?.id ?? null
  );

  const filteredMaterials = useMemo(() => {
    const query = search.trim().toLowerCase();
    let list = [...materials];
    if (categoryFilter !== 'all') {
      list = list.filter((item) => item.category === categoryFilter);
    }
    if (query) {
      list = list.filter((item) => {
        const haystack = [item.name, item.sku, item.notes, MATERIAL_CATEGORY_LABELS[item.category]]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(query);
      });
    }
    list.sort((a, b) => compareMaterials(a, b, sortMode));
    return list;
  }, [materials, search, categoryFilter, sortMode]);

  const filteredTeams = useMemo(() => {
    const query = search.trim().toLowerCase();
    let list = [...teams];
    if (query) {
      list = list.filter((team) =>
        `${team.name} ${team.category}`.toLowerCase().includes(query)
      );
    }
    list.sort((a, b) => a.name.localeCompare(b.name, 'es'));
    return list;
  }, [teams, search]);

  const filteredFacilities = useMemo(() => {
    const query = search.trim().toLowerCase();
    let list = facilities.filter((facility) => facility.active);
    if (query) {
      list = list.filter((facility) => facility.name.toLowerCase().includes(query));
    }
    list.sort((a, b) => a.name.localeCompare(b.name, 'es'));
    return list;
  }, [facilities, search]);

  const selectedMaterial =
    materials.find((item) => item.id === selectedMaterialId) ?? filteredMaterials[0] ?? null;
  const selectedTeam =
    teams.find((team) => team.id === selectedTeamId) ?? filteredTeams[0] ?? null;
  const selectedFacility =
    facilities.find((facility) => facility.id === selectedFacilityId) ??
    filteredFacilities[0] ??
    null;

  const teamInventory = useMemo(
    () =>
      selectedTeam
        ? stockByLocation('team', selectedTeam.id, materials, stock)
        : [],
    [selectedTeam, materials, stock]
  );

  const facilityInventory = useMemo(
    () =>
      selectedFacility
        ? stockByLocation('facility', selectedFacility.id, materials, stock)
        : [],
    [selectedFacility, materials, stock]
  );

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  useEffect(() => {
    if (initialMaterialId && materials.some((item) => item.id === initialMaterialId)) {
      setSelectedMaterialId(initialMaterialId);
    }
  }, [initialMaterialId, materials]);

  useEffect(() => {
    if (initialTeamId && teams.some((team) => team.id === initialTeamId)) {
      setSelectedTeamId(initialTeamId);
    }
  }, [initialTeamId, teams]);

  useEffect(() => {
    if (initialFacilityId && facilities.some((facility) => facility.id === initialFacilityId)) {
      setSelectedFacilityId(initialFacilityId);
    }
  }, [initialFacilityId, facilities]);

  useEffect(() => {
    if (initialCreateOpen) setCreateOpen(true);
  }, [initialCreateOpen]);

  const buildUrl = (params: Record<string, string | undefined>) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) query.set(key, value);
    });
    const qs = query.toString();
    return qs ? `/portal/club/material?${qs}` : '/portal/club/material';
  };

  const handleViewChange = (next: MaterialViewMode) => {
    setView(next);
    setSearch('');
    if (next === 'catalog') {
      router.replace(
        buildUrl({ view: 'catalog', material: selectedMaterial?.id }),
        { scroll: false }
      );
    } else if (next === 'team') {
      router.replace(buildUrl({ view: 'team', team: selectedTeam?.id }), { scroll: false });
    } else {
      router.replace(
        buildUrl({ view: 'facility', facility: selectedFacility?.id }),
        { scroll: false }
      );
    }
  };

  const handleSelectMaterial = (materialId: string) => {
    setSelectedMaterialId(materialId);
    router.replace(buildUrl({ view: 'catalog', material: materialId }), { scroll: false });
  };

  const handleSelectTeam = (teamId: string) => {
    setSelectedTeamId(teamId);
    router.replace(buildUrl({ view: 'team', team: teamId }), { scroll: false });
  };

  const handleSelectFacility = (facilityId: string) => {
    setSelectedFacilityId(facilityId);
    router.replace(buildUrl({ view: 'facility', facility: facilityId }), { scroll: false });
  };

  const handleMaterialSaved = (materialId: string) => {
    setCreateOpen(false);
    setSelectedMaterialId(materialId);
    setView('catalog');
    router.replace(buildUrl({ view: 'catalog', material: materialId }), { scroll: false });
    router.refresh();
  };

  const listTitle =
    view === 'catalog' ? 'Catálogo' : view === 'team' ? 'Equipos' : 'Instalaciones';
  const listCount =
    view === 'catalog'
      ? filteredMaterials.length
      : view === 'team'
        ? filteredTeams.length
        : filteredFacilities.length;
  const listTotal =
    view === 'catalog'
      ? materials.length
      : view === 'team'
        ? teams.length
        : facilities.filter((facility) => facility.active).length;

  return (
    <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
      <Card className="flex min-h-[28rem] flex-col border border-primary/25 lg:sticky lg:top-[4.5rem] lg:max-h-[calc(100vh-5.5rem)]">
        <CardHeader className="space-y-3 pb-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="text-base">Material</CardTitle>
              <CardDescription>
                {listCount} de {listTotal} {listTitle.toLowerCase()}
              </CardDescription>
            </div>
            {view === 'catalog' ? (
              <button
                type="button"
                className={actionButtonClass}
                aria-label="Nuevo material"
                title="Nuevo material"
                onClick={() => setCreateOpen(true)}
              >
                <Plus className="size-4" />
              </button>
            ) : null}
          </div>

          <div className="grid grid-cols-3 gap-1 rounded-lg border border-primary/15 bg-muted/10 p-1">
            {(
              [
                ['catalog', 'Catálogo'],
                ['team', 'Equipos'],
                ['facility', 'Instalaciones'],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => handleViewChange(value)}
                className={cn(
                  'rounded-md px-2 py-1.5 text-xs font-medium transition-colors',
                  view === value
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <PortalSearchField
              value={search}
              onChange={setSearch}
              placeholder={
                view === 'catalog'
                  ? 'Buscar material…'
                  : view === 'team'
                    ? 'Buscar equipo…'
                    : 'Buscar instalación…'
              }
            />
            {view === 'catalog' ? (
              <div className="grid gap-2 sm:grid-cols-2">
                <SynqSelect
                  value={categoryFilter}
                  onChange={setCategoryFilter}
                  options={[
                    { value: 'all', label: 'Todas las categorías' },
                    ...Object.entries(MATERIAL_CATEGORY_LABELS).map(([value, label]) => ({
                      value,
                      label,
                    })),
                  ]}
                />
                <SynqSelect
                  value={sortMode}
                  onChange={(value) => setSortMode(value as MaterialListSortMode)}
                  options={[
                    { value: 'name-asc', label: 'A → Z' },
                    { value: 'name-desc', label: 'Z → A' },
                  ]}
                />
              </div>
            ) : null}
          </div>
        </CardHeader>

        <CardContent className="min-h-0 flex-1 overflow-y-auto pt-0">
          {view === 'catalog' ? (
            filteredMaterials.length === 0 ? (
              <p className="rounded-lg border border-dashed border-primary/20 px-4 py-8 text-center text-sm text-muted-foreground">
                {materials.length === 0
                  ? 'No hay material registrado. Pulsa + para crear el primero.'
                  : 'No hay material con esos filtros.'}
              </p>
            ) : (
              <ul className="space-y-1.5">
                {filteredMaterials.map((item) => {
                  const active = selectedMaterial?.id === item.id;
                  const total = totalQuantityForMaterial(item.id, stock);
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectMaterial(item.id)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors',
                          active
                            ? 'border-primary/50 bg-primary/10 shadow-[inset_2px_0_0_0_hsl(var(--primary))]'
                            : 'border-primary/15 hover:border-primary/30 hover:bg-muted/20'
                        )}
                      >
                        <MaterialListIcon />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="truncate text-sm font-medium text-foreground">
                              {item.name}
                            </span>
                            {!item.active ? (
                              <Badge variant="outline" className="text-[9px]">
                                Pausado
                              </Badge>
                            ) : null}
                          </div>
                          <p className="truncate text-xs text-muted-foreground">
                            {MATERIAL_CATEGORY_LABELS[item.category]} · {total}{' '}
                            {MATERIAL_UNIT_LABELS[item.unit].toLowerCase()}
                          </p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )
          ) : view === 'team' ? (
            filteredTeams.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay equipos disponibles.</p>
            ) : (
              <ul className="space-y-1.5">
                {filteredTeams.map((team) => {
                  const active = selectedTeam?.id === team.id;
                  const count = stockByLocation('team', team.id, materials, stock).length;
                  return (
                    <li key={team.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectTeam(team.id)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors',
                          active
                            ? 'border-primary/50 bg-primary/10 shadow-[inset_2px_0_0_0_hsl(var(--primary))]'
                            : 'border-primary/15 hover:border-primary/30 hover:bg-muted/20'
                        )}
                      >
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/5">
                          <Layers className="size-4 text-primary/80" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">{team.name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {team.category} · {count} materiales
                          </p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )
          ) : filteredFacilities.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay instalaciones activas.</p>
          ) : (
            <ul className="space-y-1.5">
              {filteredFacilities.map((facility) => {
                const active = selectedFacility?.id === facility.id;
                const count = stockByLocation('facility', facility.id, materials, stock).length;
                return (
                  <li key={facility.id}>
                    <button
                      type="button"
                      onClick={() => handleSelectFacility(facility.id)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors',
                        active
                          ? 'border-primary/50 bg-primary/10 shadow-[inset_2px_0_0_0_hsl(var(--primary))]'
                          : 'border-primary/15 hover:border-primary/30 hover:bg-muted/20'
                      )}
                    >
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/5">
                        <MapPin className="size-4 text-primary/80" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {facility.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {count} materiales asignados
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

      {view === 'catalog' ? (
        <CatalogDetailPanel
          material={selectedMaterial}
          stock={stock}
          teams={teams}
          facilities={facilities}
          initialEditOpen={initialEditOpen}
          onAddStock={() => undefined}
        />
      ) : view === 'team' ? (
        <LocationDetailPanel
          title={selectedTeam?.name ?? 'Equipo'}
          subtitle={
            selectedTeam
              ? `Inventario asignado a ${selectedTeam.name} · ${selectedTeam.category}`
              : 'Selecciona un equipo'
          }
          rows={teamInventory}
        />
      ) : (
        <LocationDetailPanel
          title={selectedFacility?.name ?? 'Instalación'}
          subtitle={
            selectedFacility
              ? locationLabel({
                  location_type: 'facility',
                  location_id: selectedFacility.id,
                  facilityName: selectedFacility.name,
                })
              : 'Selecciona una instalación'
          }
          rows={facilityInventory}
        />
      )}

      <Sheet open={createOpen} onOpenChange={setCreateOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto border-primary/20 sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Nuevo material</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <MaterialForm onSaved={handleMaterialSaved} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
