"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Warehouse,
  MapPin,
  Plus,
  Search,
  Trash2,
  Edit3,
  Loader2,
  Package,
  Boxes,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { canUseOperativaSupabase } from "@/lib/operativa-sync";
import { useClubModulePermissions } from "@/hooks/use-club-module-permissions";

type WarehouseInstallation = {
  id: string;
  clubId: string;
  name: string;
  address?: string;
  createdAt: string;
};

type WarehouseStore = {
  id: string;
  clubId: string;
  installationId: string;
  name: string;
  createdAt: string;
};

type WarehouseMaterial = {
  id: string;
  storeId: string;
  itemKey?: string;
  item: string;
  quantity: number | null;
  unit: string;
  location?: string;
  notes?: string;
  allocations?: Array<{ teamId: string; quantity: number | null }>;
  createdAt: string;
};

type WarehouseState = {
  installations: WarehouseInstallation[];
  stores: WarehouseStore[];
  materials: WarehouseMaterial[];
};

const STORAGE_PREFIX = "synq_methodology_warehouse_v1";
const FACILITIES_STORAGE_PREFIX = "synq_methodology_facilities_v1";
const TEAMS_STORAGE_PREFIX = "synq_methodology_warehouse_teams_v1";

const MATERIAL_CATALOG: Array<{ key: string; label: string; unit: string }> = [
  { key: "BALONES", label: "Balones", unit: "ud" },
  { key: "ESCALERAS", label: "Escaleras de agilidad", unit: "ud" },
  { key: "CONOS", label: "Conos", unit: "ud" },
  { key: "SETAS", label: "Setas", unit: "ud" },
  { key: "MINI_VALLAS", label: "Mini vallas", unit: "ud" },
  { key: "MINI_PORTERIAS", label: "Mini porterías", unit: "ud" },
  { key: "CINTAS", label: "Cintas", unit: "ud" },
  { key: "PICAs", label: "Picas", unit: "ud" },
];

type WarehouseTeam = {
  id: string;
  clubId: string;
  name: string;
  stage: string;
  createdAt: string;
};

const DEFAULT_TEAMS_BY_STAGE: Array<{ stage: string; teams: string[] }> = [
  { stage: "Debutantes", teams: ["Debutantes A", "Debutantes B"] },
  { stage: "Prebenjamín", teams: ["Prebenjamín A", "Prebenjamín B"] },
  { stage: "Benjamín", teams: ["Benjamín A", "Benjamín B"] },
  { stage: "Alevín", teams: ["Alevín A", "Alevín B"] },
  { stage: "Infantil", teams: ["Infantil A"] },
  { stage: "Cadete", teams: ["Cadete A"] },
  { stage: "Juvenil", teams: ["Juvenil A"] },
];

function buildDefaultTeams(clubId: string): WarehouseTeam[] {
  const now = new Date().toISOString();
  const out: WarehouseTeam[] = [];
  for (const block of DEFAULT_TEAMS_BY_STAGE) {
    for (const tName of block.teams) {
      out.push({
        id: `team-${tName.replace(/\s+/g, "_").toLowerCase()}-${Date.now()}`,
        clubId,
        name: tName,
        stage: block.stage,
        createdAt: now,
      });
    }
  }
  return out;
}

function teamsStorageKey(clubId: string) {
  return `${TEAMS_STORAGE_PREFIX}_${clubId}`;
}

function safeParseTeams(raw: string | null): WarehouseTeam[] {
  try {
    const parsed = JSON.parse(raw ?? "[]") as unknown;
    return Array.isArray(parsed) ? (parsed as WarehouseTeam[]) : [];
  } catch {
    return [];
  }
}

function safeParseState(raw: string | null): WarehouseState {
  try {
    const parsed = JSON.parse(raw ?? "{}") as Partial<WarehouseState>;
    return {
      installations: Array.isArray(parsed.installations) ? parsed.installations : [],
      stores: Array.isArray(parsed.stores) ? parsed.stores : [],
      materials: Array.isArray(parsed.materials) ? parsed.materials : [],
    };
  } catch {
    return { installations: [], stores: [], materials: [] };
  }
}

function storageKey(clubId: string) {
  return `${STORAGE_PREFIX}_${clubId}`;
}

export default function WarehouseClubPage() {
  const { toast } = useToast();
  const { profile, session } = useAuth();
  const plannerPerms = useClubModulePermissions("planner");
  const isElevated = profile?.role === "superadmin" || profile?.role === "club_admin";
  const canMutateWarehouse = isElevated || plannerPerms.canEdit;
  const canDeleteWarehouse = isElevated || plannerPerms.canDelete;

  const clubScopeId = profile?.clubId ?? "global-hq";
  const canUseWarehouseSupabase = canUseOperativaSupabase(clubScopeId) && !!session?.access_token;
  const remoteAccessToken = session?.access_token;
  const [syncMode, setSyncMode] = useState<"remote" | "local" | "restricted">("local");

  const [state, setState] = useState<WarehouseState>({ installations: [], stores: [], materials: [] });
  const [loading, setLoading] = useState(false);

  const [teams, setTeams] = useState<WarehouseTeam[]>([]);

  const [selectedInstallationId, setSelectedInstallationId] = useState<string | null>(null);
  const selectedInstallation = useMemo(
    () => state.installations.find((i) => i.id === selectedInstallationId) ?? null,
    [state.installations, selectedInstallationId],
  );
  const storesForInstallation = useMemo(
    () => state.stores.filter((s) => s.installationId === selectedInstallationId),
    [state.stores, selectedInstallationId],
  );
  const selectedStore = storesForInstallation[0] ?? null;

  const [installationsSearch, setInstallationsSearch] = useState("");
  const [materialsSearch, setMaterialsSearch] = useState("");

  const filteredInstallations = useMemo(() => {
    const q = installationsSearch.trim().toLowerCase();
    if (!q) return state.installations;
    return state.installations.filter((i) => i.name.toLowerCase().includes(q) || (i.address ?? "").toLowerCase().includes(q));
  }, [installationsSearch, state.installations]);

  const materialsForStore = useMemo(() => {
    if (!selectedStore) return [];
    const q = materialsSearch.trim().toLowerCase();
    const list = state.materials.filter((m) => m.storeId === selectedStore.id);
    if (!q) return list;
    return list.filter(
      (m) =>
        m.item.toLowerCase().includes(q) ||
        (m.location ?? "").toLowerCase().includes(q) ||
        (m.notes ?? "").toLowerCase().includes(q),
    );
  }, [materialsSearch, selectedStore, state.materials]);

  const totals = useMemo(() => {
    if (!selectedStore) return { items: 0, quantitySum: 0 };
    const items = state.materials.filter((m) => m.storeId === selectedStore.id);
    const quantitySum = items.reduce((acc, m) => acc + (m.quantity ?? 0), 0);
    return { items: items.length, quantitySum };
  }, [selectedStore, state.materials]);

  useEffect(() => {
    setLoading(true);
    const run = async () => {
      if (typeof window === "undefined") return;

      const facilitiesKey = `${FACILITIES_STORAGE_PREFIX}_${clubScopeId}`;
      let facilities: any[] = [];
      // Fuente única preferente: API segura de instalaciones.
      if (canUseWarehouseSupabase && remoteAccessToken) {
        try {
          const facRes = await fetch("/api/club/facilities", {
            headers: { Authorization: `Bearer ${remoteAccessToken}` },
          });
          if (facRes.status === 404) {
            // Endpoint no desplegado en este entorno: fallback local sin romper la vista.
            setSyncMode((prev) => (prev === "remote" ? "remote" : "local"));
          } else if (facRes.ok) {
            const facJson = (await facRes.json()) as { payload?: { facilities?: unknown[] } };
            const fromApi = facJson?.payload?.facilities;
            if (Array.isArray(fromApi)) {
              facilities = fromApi as any[];
              localStorage.setItem(facilitiesKey, JSON.stringify(facilities));
            }
          }
        } catch {
          // fallback local
        }
      }
      if (facilities.length === 0) {
        const facilitiesRaw = localStorage.getItem(facilitiesKey);
        try {
          const parsed = JSON.parse(facilitiesRaw ?? "[]") as any[];
          facilities = Array.isArray(parsed) ? parsed : [];
        } catch {
          facilities = [];
        }
      }

      const installationsFromFacilities: WarehouseInstallation[] = facilities.map((f) => ({
        id: String(f.id),
        clubId: clubScopeId,
        name: String(f.name ?? f.id),
        address: undefined,
        createdAt: String(f.createdAt ?? new Date().toISOString()),
      }));

      const key = storageKey(clubScopeId);

      // Fuente de verdad (híbrido): si hay Supabase, cargamos el estado remoto; si no, localStorage.
      let loaded = safeParseState(localStorage.getItem(key));
      let remoteTeams: WarehouseTeam[] | null = null;

      if (canUseWarehouseSupabase && remoteAccessToken) {
        try {
          const res = await fetch("/api/club/methodology-warehouse", {
            headers: { Authorization: `Bearer ${remoteAccessToken}` },
          });
          if (res.status === 403) {
            setSyncMode("restricted");
          } else if (res.ok) {
            setSyncMode("remote");
            const json = (await res.json()) as { ok?: boolean; payload?: any };
            const payload = json?.payload ?? {};
            const remoteState = payload?.state;
            if (remoteState && typeof remoteState === "object") {
              loaded = remoteState as WarehouseState;
            }
            if (Array.isArray(payload?.teams)) {
              remoteTeams = payload.teams as WarehouseTeam[];
            }
          } else {
            setSyncMode("local");
          }
        } catch {
          // fallback => localStorage
          setSyncMode("local");
        }
      } else {
        setSyncMode("local");
      }

      const facilityIds = new Set(installationsFromFacilities.map((i) => i.id));
      const filteredStores = loaded.stores.filter((s) => facilityIds.has(s.installationId));
      const storeIds = new Set(filteredStores.map((s) => s.id));
      const filteredMaterials = loaded.materials.filter((m) => storeIds.has(m.storeId));

      const now = new Date().toISOString();
      const missingStores: WarehouseStore[] = installationsFromFacilities
        .filter((inst) => !filteredStores.some((s) => s.installationId === inst.id))
        .map((inst) => ({
          id: `store-${inst.id}`,
          clubId: clubScopeId,
          installationId: inst.id,
          name: `ALMACÉN DE ${inst.name}`,
          createdAt: now,
        }));

      const nextState: WarehouseState = {
        installations: installationsFromFacilities,
        stores: [...missingStores, ...filteredStores],
        materials: filteredMaterials,
      };

      setState(nextState);
      if (!selectedInstallationId && installationsFromFacilities.length > 0) {
        setSelectedInstallationId(installationsFromFacilities[0].id);
      }

      // Persist cache local siempre para continuidad del mock.
      localStorage.setItem(key, JSON.stringify(nextState));

      // Equipos: si hay remoto, usamos remoto; si no, defaults.
      const keyTeams = teamsStorageKey(clubScopeId);
      if (remoteTeams && remoteTeams.length > 0) {
        setTeams(remoteTeams);
        try {
          localStorage.setItem(keyTeams, JSON.stringify(remoteTeams));
        } catch {
          // ignore
        }
      } else {
        const loadedTeams = safeParseTeams(localStorage.getItem(keyTeams));
        if (loadedTeams.length > 0) {
          setTeams(loadedTeams);
        } else {
          const defaults = buildDefaultTeams(clubScopeId);
          setTeams(defaults);
          try {
            localStorage.setItem(keyTeams, JSON.stringify(defaults));
          } catch {
            // ignore
          }
        }
      }
    };

    void run().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clubScopeId, canUseWarehouseSupabase, remoteAccessToken]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (canUseWarehouseSupabase) return; // en modo Supabase, los equipos se cargan del estado remoto
    const key = teamsStorageKey(clubScopeId);
    const loaded = safeParseTeams(localStorage.getItem(key));
    if (loaded.length > 0) {
      setTeams(loaded);
      return;
    }
    const defaults = buildDefaultTeams(clubScopeId);
    setTeams(defaults);
    localStorage.setItem(key, JSON.stringify(defaults));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clubScopeId, canUseWarehouseSupabase]);

  const remotePersistTimerRef = useRef<number | null>(null);

  function persist(next: WarehouseState) {
    setState(next);
    const key = storageKey(clubScopeId);
    localStorage.setItem(key, JSON.stringify(next));

    if (!canUseWarehouseSupabase || !remoteAccessToken) return;
    if (remotePersistTimerRef.current) window.clearTimeout(remotePersistTimerRef.current);

    remotePersistTimerRef.current = window.setTimeout(() => {
      void fetch("/api/club/methodology-warehouse", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${remoteAccessToken}`,
        },
        body: JSON.stringify({
          payload: {
            state: next,
            teams,
          },
        }),
      }).catch(() => {
        // ignore => localStorage cache still works
      });
    }, 600);
  }

  // ---------------------------------------------------------------------------
  // Instalación sheet (crear/editar)
  // ---------------------------------------------------------------------------
  const [isInstallationSheetOpen, setIsInstallationSheetOpen] = useState(false);
  const [editingInstallationId, setEditingInstallationId] = useState<string | null>(null);
  const [installationDraft, setInstallationDraft] = useState({ name: "", address: "" });

  const openCreateInstallation = () => {
    setEditingInstallationId(null);
    setInstallationDraft({ name: "", address: "" });
    setIsInstallationSheetOpen(true);
  };

  const openEditInstallation = (inst: WarehouseInstallation) => {
    setEditingInstallationId(inst.id);
    setInstallationDraft({ name: inst.name, address: inst.address ?? "" });
    setIsInstallationSheetOpen(true);
  };

  const saveInstallation = () => {
    if (!canMutateWarehouse) {
      toast({ variant: "destructive", title: "SIN_PERMISOS", description: "Tu rol no puede editar el almacén (matriz del club)." });
      return;
    }
    if (!installationDraft.name.trim()) {
      toast({ variant: "destructive", title: "NOMBRE_REQUERIDO", description: "Indica un nombre para la instalación." });
      return;
    }
    const now = new Date().toISOString();
    if (editingInstallationId) {
      const next = {
        ...state,
        installations: state.installations.map((i) =>
          i.id === editingInstallationId ? { ...i, name: installationDraft.name.trim().toUpperCase(), address: installationDraft.address.trim() || undefined } : i,
        ),
      };
      persist(next);
      toast({ title: "INSTALACIÓN_ACTUALIZADA", description: installationDraft.name.trim().toUpperCase() });
    } else {
      const id = `inst-${Date.now()}`;
      const storeId = `store-${Date.now()}`;
      const inst: WarehouseInstallation = {
        id,
        clubId: clubScopeId,
        name: installationDraft.name.trim().toUpperCase(),
        address: installationDraft.address.trim() || undefined,
        createdAt: now,
      };
      const store: WarehouseStore = {
        id: storeId,
        clubId: clubScopeId,
        installationId: id,
        name: `ALMACÉN DE ${inst.name}`,
        createdAt: now,
      };
      const next = {
        installations: [inst, ...state.installations],
        stores: [store, ...state.stores],
        materials: state.materials,
      };
      persist(next);
      setSelectedInstallationId(id);
      toast({ title: "INSTALACIÓN_CREADA", description: `Se creó y vinculó ${store.name}` });
    }
    setIsInstallationSheetOpen(false);
  };

  // ---------------------------------------------------------------------------
  // Material sheet (crear/editar)
  // ---------------------------------------------------------------------------
  const [isMaterialSheetOpen, setIsMaterialSheetOpen] = useState(false);
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);
  const [materialDraft, setMaterialDraft] = useState({
    itemKey: MATERIAL_CATALOG[0]?.key ?? "BALONES",
    item: MATERIAL_CATALOG[0]?.label ?? "Balones",
    unit: MATERIAL_CATALOG[0]?.unit ?? "ud",
    location: "",
    notes: "",
  });

  const [teamQuantitiesDraft, setTeamQuantitiesDraft] = useState<Record<string, string>>({});

  const openCreateMaterial = () => {
    if (!selectedStore) {
      toast({ variant: "destructive", title: "SIN_ALMACÉN", description: "Crea primero una instalación (y su almacén)." });
      return;
    }
    setEditingMaterialId(null);
    const first = MATERIAL_CATALOG[0];
    setMaterialDraft({
      itemKey: first?.key ?? "BALONES",
      item: first?.label ?? "Balones",
      unit: first?.unit ?? "ud",
      location: selectedStore.name,
      notes: "",
    });
    setTeamQuantitiesDraft({});
    setIsMaterialSheetOpen(true);
  };

  const openEditMaterial = (m: WarehouseMaterial) => {
    setEditingMaterialId(m.id);
    const catalogRow = m.itemKey ? MATERIAL_CATALOG.find((x) => x.key === m.itemKey) : undefined;
    setMaterialDraft({
      itemKey: catalogRow?.key ?? m.itemKey ?? (MATERIAL_CATALOG[0]?.key ?? "BALONES"),
      item: catalogRow?.label ?? m.item,
      unit: catalogRow?.unit ?? m.unit ?? "ud",
      location: m.location ?? selectedStore?.name ?? "",
      notes: m.notes ?? "",
    });
    const nextTeamQ: Record<string, string> = {};
    for (const a of m.allocations ?? []) {
      nextTeamQ[a.teamId] = a.quantity === null ? "" : String(a.quantity);
    }
    setTeamQuantitiesDraft(nextTeamQ);
    setIsMaterialSheetOpen(true);
  };

  const saveMaterial = () => {
    if (!canMutateWarehouse) {
      toast({ variant: "destructive", title: "SIN_PERMISOS", description: "Tu rol no puede editar materiales (matriz del club)." });
      return;
    }
    if (!selectedStore) return;

    const allocations: Array<{ teamId: string; quantity: number | null }> = [];
    for (const team of teams) {
      const raw = teamQuantitiesDraft[team.id];
      if (raw === undefined) continue;
      const trimmed = raw.trim();
      if (trimmed === "") continue;
      const num = Number(trimmed);
      if (Number.isNaN(num) || num < 0) continue;
      if (num === 0) continue;
      allocations.push({ teamId: team.id, quantity: num });
    }

    const total = allocations.reduce((acc, a) => acc + (a.quantity ?? 0), 0);
    if (total <= 0) {
      toast({
        variant: "destructive",
        title: "ASIGNACIÓN_VACÍA",
        description: "Indica al menos una cantidad > 0 para algún equipo.",
      });
      return;
    }

    const now = new Date().toISOString();
    const location = (materialDraft.location || selectedStore.name).trim().toUpperCase();

    if (editingMaterialId) {
      const next: WarehouseState = {
        ...state,
        materials: state.materials.map((m) =>
          m.id === editingMaterialId
            ? {
                ...m,
                itemKey: materialDraft.itemKey,
                item: materialDraft.item.trim().toUpperCase(),
                quantity: total,
                unit: materialDraft.unit.trim().toUpperCase() || "UD",
                location,
                allocations,
                notes: materialDraft.notes.trim() || undefined,
              }
            : m,
        ),
      };
      persist(next);
      toast({ title: "MATERIAL_ACTUALIZADO", description: `${materialDraft.item.trim().toUpperCase()} · Σ${total}` });
    } else {
      const mat: WarehouseMaterial = {
        id: `mat-${Date.now()}`,
        storeId: selectedStore.id,
        itemKey: materialDraft.itemKey,
        item: materialDraft.item.trim().toUpperCase(),
        quantity: total,
        unit: materialDraft.unit.trim().toUpperCase() || "UD",
        location,
        allocations,
        notes: materialDraft.notes.trim() || undefined,
        createdAt: now,
      };

      const next: WarehouseState = {
        ...state,
        materials: [mat, ...state.materials],
      };
      persist(next);
      toast({ title: "MATERIAL_AÑADIDO", description: `${mat.item} · Σ${total}` });
    }
    setIsMaterialSheetOpen(false);
  };

  const deleteMaterial = (id: string) => {
    if (!canDeleteWarehouse) {
      toast({ variant: "destructive", title: "SIN_PERMISOS", description: "Tu rol no puede eliminar materiales (matriz del club)." });
      return;
    }
    if (!confirm("¿Eliminar este material del almacén?")) return;
    const next = { ...state, materials: state.materials.filter((m) => m.id !== id) };
    persist(next);
    toast({ title: "MATERIAL_ELIMINADO" });
  };

  const deleteInstallation = (id: string) => {
    if (!canDeleteWarehouse) {
      toast({ variant: "destructive", title: "SIN_PERMISOS", description: "Tu rol no puede eliminar instalaciones del almacén." });
      return;
    }
    if (!confirm("¿Eliminar la instalación y su almacén? (materiales asociados también)")) return;
    const storesToDelete = state.stores.filter((s) => s.installationId === id).map((s) => s.id);
    const next = {
      installations: state.installations.filter((i) => i.id !== id),
      stores: state.stores.filter((s) => s.installationId !== id),
      materials: state.materials.filter((m) => !storesToDelete.includes(m.storeId)),
    };
    persist(next);
    if (selectedInstallationId === id) {
      setSelectedInstallationId(next.installations[0]?.id ?? null);
    }
    toast({ title: "INSTALACIÓN_ELIMINADA" });
  };

  const canEditInstallations = false; // instalaciones se gestionan en `/dashboard/instalaciones`

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 p-8 lg:p-12">
      <div className="flex justify-between items-end border-b border-white/5 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <Warehouse className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-[10px] font-black text-primary/80 tracking-[0.5em] uppercase italic">
              Club_Warehouse_Control
            </span>
          </div>
          <h1 className="text-4xl font-headline font-black text-white uppercase tracking-tighter italic cyan-text-glow leading-none">
            ALMACÉN (CLUB)
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 mt-2">
            Inventario por instalaciones (ligado a tu club). Prototipo localStorage hasta conectar BD.
          </p>
          <p
            className={cn(
              "text-[9px] font-black uppercase tracking-widest mt-1",
              syncMode === "remote"
                ? "text-emerald-400/80"
                : syncMode === "restricted"
                ? "text-rose-400/80"
                : "text-white/40",
            )}
          >
            {syncMode === "remote"
              ? "SINCRO_REMOTA_ACTIVA"
              : syncMode === "restricted"
              ? "MODO_LOCAL_POR_PERMISOS"
              : "MODO_LOCAL_FALLBACK"}
          </p>
        </div>

        <div className="flex gap-3">
          {/* Las instalaciones se crean/gestionan desde `/dashboard/instalaciones` */}
        </div>
      </div>

      {loading ? (
        <div className="h-[300px] flex items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[420px_1fr]">
          <div className="space-y-6">
            <Card className="glass-panel border-primary/20 bg-black/40 overflow-hidden rounded-3xl">
              <CardHeader className="p-6 border-b border-white/5">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-sm font-black uppercase tracking-widest text-primary/60">
                    Instalaciones
                  </CardTitle>
                  <Badge variant="outline" className="border-primary/20 text-primary text-[8px] font-black uppercase">
                    {state.installations.length}
                  </Badge>
                </div>
                <div className="mt-4 relative">
                  <Search className="h-4 w-4 absolute left-3 top-3.5 text-primary/60" />
                  <Input
                    value={installationsSearch}
                    onChange={(e) => setInstallationsSearch(e.target.value)}
                    placeholder="Buscar instalación..."
                    className="pl-10 h-12 bg-black/30 border-primary/20 rounded-2xl text-primary font-bold uppercase text-[10px] tracking-widest"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-4 space-y-3">
                  {filteredInstallations.length === 0 ? (
                    <div className="py-8 text-center text-[10px] font-bold uppercase text-white/35">
                      {canMutateWarehouse ? "Crea tu primera instalación." : "No hay instalaciones visibles para tu perfil."}
                    </div>
                  ) : (
                    filteredInstallations.map((inst) => {
                      const isActive = inst.id === selectedInstallationId;
                      const store = state.stores.find((s) => s.installationId === inst.id) ?? null;
                      const itemCount = store ? state.materials.filter((m) => m.storeId === store.id).length : 0;
                      return (
                        <button
                          key={inst.id}
                          type="button"
                          onClick={() => setSelectedInstallationId(inst.id)}
                          className={cn(
                            "w-full text-left rounded-2xl border p-4 transition-all",
                            isActive
                              ? "border-primary/30 bg-primary/5"
                              : "border-white/5 bg-black/20 hover:border-primary/20",
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-primary/70" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-white">
                                  {inst.name}
                                </p>
                              </div>
                              <p className="text-[8px] font-bold uppercase tracking-widest text-white/30">
                                Almacén: {store ? store.name : "—"}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className="border-primary/20 text-primary text-[8px] font-black uppercase"
                            >
                              {itemCount} ítems
                            </Badge>
                          </div>
                          {canEditInstallations && (
                            <div className="mt-3 flex gap-2 justify-end">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-xl border border-white/5 text-primary/50 hover:text-primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditInstallation(inst);
                                }}
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-xl border border-white/5 text-rose-500/40 hover:text-rose-500"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteInstallation(inst.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="glass-panel border-primary/20 bg-black/40 overflow-hidden rounded-3xl">
              <CardHeader className="p-6 border-b border-white/5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-black uppercase tracking-widest text-primary/60">
                      Inventario
                    </CardTitle>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/35">
                      {selectedStore ? selectedStore.name : "Selecciona una instalación"}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Badge variant="outline" className="border-primary/20 text-primary text-[8px] font-black uppercase">
                      {totals.items} ítems
                    </Badge>
                    <Badge variant="outline" className="border-white/10 text-white/60 text-[8px] font-black uppercase">
                      Σ {totals.quantitySum}
                    </Badge>
                  </div>
                </div>

                <div className="mt-4 relative">
                  <Search className="h-4 w-4 absolute left-3 top-3.5 text-primary/50" />
                  <Input
                    value={materialsSearch}
                    onChange={(e) => setMaterialsSearch(e.target.value)}
                    placeholder="Buscar material o ubicación..."
                    className="pl-10 h-12 bg-black/30 border-primary/20 rounded-2xl text-primary font-bold uppercase text-[10px] tracking-widest"
                  />
                </div>

                <div className="mt-4 flex justify-end">
                  <Button
                    type="button"
                    onClick={openCreateMaterial}
                    disabled={!canMutateWarehouse || !selectedStore}
                    className="rounded-2xl bg-primary text-black font-black uppercase text-[10px] tracking-widest h-12 px-8 shadow-[0_0_20px_rgba(0,242,255,0.3)] hover:scale-105 transition-all border-none disabled:opacity-40"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Añadir material
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-white/[0.02]">
                    <TableRow className="border-white/5">
                      <TableHead className="pl-8 text-[10px] font-black uppercase tracking-widest text-white/40">
                        Material
                      </TableHead>
                      <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-white/40">
                        Cantidad
                      </TableHead>
                      <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-white/40">
                        Ubicación
                      </TableHead>
                      <TableHead className="pr-8 text-right text-[10px] font-black uppercase tracking-widest text-white/40">
                        Acciones
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedStore ? (
                      materialsForStore.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="py-12 text-center text-[10px] font-bold uppercase text-white/35">
                            {canMutateWarehouse ? "No hay materiales aún. Añade uno." : "No hay materiales."}
                          </TableCell>
                        </TableRow>
                      ) : (
                        materialsForStore.map((m) => (
                          <TableRow
                            key={m.id}
                            className="border-white/5 hover:bg-primary/[0.03] transition-colors group"
                          >
                            <TableCell className="pl-8 py-5">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-center">
                                  <Package className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-white">
                                    {m.item}
                                  </p>
                                  {m.notes ? (
                                    <p className="text-[8px] text-white/30 font-bold uppercase tracking-widest mt-1">
                                      {m.notes}
                                    </p>
                                  ) : null}
                                  {m.allocations && m.allocations.length > 0 ? (
                                    <p className="text-[8px] text-emerald-400/70 font-bold uppercase tracking-widest mt-1">
                                      {m.allocations
                                        .map((a) => {
                                          const t = teams.find((tt) => tt.id === a.teamId);
                                          return `${t?.name ?? a.teamId}:${a.quantity ?? 0}`;
                                        })
                                        .join(" · ")}
                                    </p>
                                  ) : null}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="text-[10px] font-black text-white">
                                {m.quantity === null ? "—" : m.quantity}{" "}
                                <span className="text-[9px] text-primary/80 font-black uppercase">{m.unit}</span>
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="border-primary/20 text-primary text-[9px] font-black uppercase">
                                {m.location ?? selectedStore.name}
                              </Badge>
                            </TableCell>
                            <TableCell className="pr-8 text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 rounded-xl border border-white/5 text-primary/40 hover:text-primary disabled:opacity-40"
                                  onClick={() => openEditMaterial(m)}
                                  disabled={!canMutateWarehouse}
                                >
                                  <Edit3 className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 rounded-xl border border-white/5 text-rose-500/40 hover:text-rose-500 disabled:opacity-40"
                                  onClick={() => deleteMaterial(m.id)}
                                  disabled={!canDeleteWarehouse}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="py-12 text-center text-[10px] font-bold uppercase text-white/35">
                          Selecciona una instalación para ver el almacén.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Installation Sheet */}
      <Sheet open={isInstallationSheetOpen} onOpenChange={setIsInstallationSheetOpen}>
        <SheetContent side="right" className="bg-[#04070c]/98 backdrop-blur-3xl border-l border-primary/20 text-white w-full sm:max-w-xl p-0 overflow-hidden flex flex-col shadow-[-20px_0_60px_rgba(0,0,0,0.8)]">
          <div className="p-10 border-b border-white/5 bg-black/40">
            <SheetHeader className="space-y-4 text-left">
              <div className="flex items-center gap-3">
                <Warehouse className="h-5 w-5 text-primary/80" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/80 italic">
                  INSTALACIÓN_FACTORY
                </span>
              </div>
              <SheetTitle className="text-4xl font-black italic tracking-tighter text-white uppercase">
                {editingInstallationId ? "EDITAR INSTALACIÓN" : "NUEVA INSTALACIÓN"}
              </SheetTitle>
            </SheetHeader>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-8">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">
                Nombre
              </Label>
              <Input
                value={installationDraft.name}
                onChange={(e) => setInstallationDraft((d) => ({ ...d, name: e.target.value }))}
                placeholder="EJ: Campo Principal"
                className="h-14 bg-black/40 border-primary/20 rounded-2xl font-bold uppercase focus:border-primary text-primary"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">
                Dirección / notas
              </Label>
              <Input
                value={installationDraft.address}
                onChange={(e) => setInstallationDraft((d) => ({ ...d, address: e.target.value }))}
                placeholder="Opcional"
                className="h-14 bg-black/40 border-primary/20 rounded-2xl font-bold uppercase focus:border-primary text-primary"
              />
            </div>
          </div>

          <div className="p-10 bg-black/60 border-t border-white/5 flex gap-4">
            <SheetClose asChild>
              <Button variant="ghost" className="flex-1 h-16 border border-primary/20 text-primary/60 font-black uppercase text-[10px] tracking-widest rounded-2xl">
                CANCELAR
              </Button>
            </SheetClose>
            <Button
              onClick={saveInstallation}
              disabled={!canMutateWarehouse}
              className="flex-[2] h-16 bg-primary text-black font-black uppercase text-[10px] tracking-[0.3em] rounded-2xl shadow-[0_0_30px_rgba(0,242,255,0.2)] disabled:opacity-40"
            >
              {editingInstallationId ? "GUARDAR" : "CREAR"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Material Sheet */}
      <Sheet open={isMaterialSheetOpen} onOpenChange={setIsMaterialSheetOpen}>
        <SheetContent side="right" className="bg-[#04070c]/98 backdrop-blur-3xl border-l border-primary/20 text-white w-full sm:max-w-xl p-0 overflow-hidden flex flex-col shadow-[-20px_0_60px_rgba(0,0,0,0.8)]">
          <div className="p-10 border-b border-white/5 bg-black/40">
            <SheetHeader className="space-y-4 text-left">
              <div className="flex items-center gap-3">
                <Boxes className="h-5 w-5 text-primary/80" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/80 italic">
                  INVENTORY_ITEM
                </span>
              </div>
              <SheetTitle className="text-4xl font-black italic tracking-tighter text-white uppercase">
                {editingMaterialId ? "EDITAR MATERIAL" : "AÑADIR MATERIAL"}
              </SheetTitle>
            </SheetHeader>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">
                  Material (catálogo)
                </Label>
                <Select
                  value={materialDraft.itemKey}
                  onValueChange={(v) => {
                    const row = MATERIAL_CATALOG.find((x) => x.key === v);
                    if (!row) return;
                    setMaterialDraft((d) => ({
                      ...d,
                      itemKey: row.key,
                      item: row.label,
                      unit: row.unit,
                    }));
                  }}
                >
                  <SelectTrigger className="h-14 bg-black/40 border-primary/20 rounded-2xl font-bold uppercase text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#04070c] border-primary/20 rounded-xl">
                    {MATERIAL_CATALOG.map((m) => (
                      <SelectItem key={m.key} value={m.key} className="text-[10px] font-black uppercase">
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">
                  Unidad
                </Label>
                <Input
                  value={materialDraft.unit}
                  disabled
                  className="h-14 bg-black/40 border-primary/20 rounded-2xl font-bold uppercase focus:border-primary text-primary"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">
                Ubicación (instalación activa)
              </Label>
              <Input
                value={materialDraft.location || selectedStore?.name || ""}
                onChange={(e) => setMaterialDraft((d) => ({ ...d, location: e.target.value }))}
                className="h-14 bg-black/40 border-primary/20 rounded-2xl font-bold uppercase focus:border-primary text-primary"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">
                Asignación por equipo (cantidad por equipo)
              </Label>
              <div className="rounded-2xl border border-white/5 bg-black/30 p-4 space-y-3">
                {teams.length === 0 ? (
                  <p className="text-[10px] font-bold uppercase text-white/35">Crea equipos primero (prototipo).</p>
                ) : (
                  teams.map((t) => (
                    <div key={t.id} className="flex items-center justify-between gap-3">
                      <span className="text-[10px] font-black uppercase text-white/70">{t.name}</span>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={0}
                          value={teamQuantitiesDraft[t.id] ?? ""}
                          onChange={(e) =>
                            setTeamQuantitiesDraft((prev) => ({
                              ...prev,
                              [t.id]: e.target.value,
                            }))
                          }
                          placeholder="0"
                          className="w-28 h-12 bg-black/40 border-primary/20 rounded-2xl font-bold uppercase text-primary"
                        />
                        <span className="text-[9px] font-black uppercase text-primary/60">{materialDraft.unit}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">
                Notas (opcional)
              </Label>
              <Input
                value={materialDraft.notes}
                onChange={(e) => setMaterialDraft((d) => ({ ...d, notes: e.target.value }))}
                placeholder="EJ: color, marca, etc."
                className="h-14 bg-black/40 border-primary/20 rounded-2xl font-bold uppercase focus:border-primary text-primary"
              />
            </div>
          </div>

          <div className="p-10 bg-black/60 border-t border-white/5 flex gap-4">
            <SheetClose asChild>
              <Button variant="ghost" className="flex-1 h-16 border border-primary/20 text-primary/60 font-black uppercase text-[10px] tracking-widest rounded-2xl">
                CANCELAR
              </Button>
            </SheetClose>
            <Button
              onClick={saveMaterial}
              disabled={!canMutateWarehouse}
              className="flex-[2] h-16 bg-primary text-black font-black uppercase text-[10px] tracking-[0.3em] rounded-2xl shadow-[0_0_30px_rgba(0,242,255,0.2)] disabled:opacity-40"
            >
              {editingMaterialId ? "GUARDAR" : "AÑADIR"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

