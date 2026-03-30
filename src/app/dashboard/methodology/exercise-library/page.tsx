
"use client";

import { useEffect, useMemo, useState } from "react";
import { 
  Library, 
  Plus, 
  Search, 
  ShieldCheck, 
  Activity, 
  Pencil, 
  Trash2, 
  Filter,
  CheckCircle2,
  Lock,
  Globe,
  MoreHorizontal,
  ChevronRight,
  Info,
  Clock,
  Maximize2,
  Target,
  Zap,
  Dumbbell,
  Layers,
  ClipboardList,
  Boxes,
  ScrollText,
  AlertCircle,
  Camera,
  Upload,
  PencilLine,
  ArrowRight,
  X,
  BookOpen
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { STORAGE_METHODOLOGY_NEURAL } from "@/lib/neural-warehouse";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { useClubModulePermissions } from "@/hooks/use-club-module-permissions";

const STAGES = ["Debutantes", "Prebenjamín", "Benjamín", "Alevín", "Infantil", "Cadete", "Juvenil", "Senior"];

type LibraryStatus = "Draft" | "Official";
type MethodologyLibraryEntry = {
  id: string;
  savedAt: string;
  status: LibraryStatus;
  stage: string;
  dimension: string;
  title: string;
  authorName: string;
  videoUrl?: string;
  didacticStrategy?: string;
  objectives?: string;
  conditionalContent?: string;
  time?: string;
  space?: string;
  gameSituation?: string;
  technicalAction?: string;
  tacticalAction?: string;
  collectiveContent?: string;
  description?: string;
  provocationRules?: string;
  instructions?: string;
  equipment?: string;
  photoUrl?: string;
  // Persistencia opcional de la pizarra (para que al “editar” no se abra en blanco).
  elements?: unknown[];
  board?: {
    fieldType?: string;
    showLanes?: boolean;
    isHalfField?: boolean;
  };
  /** Fracciones 0–1 del rectángulo del canvas táctico (mismo encuadre que el campo). */
  boardCoordSpace?: string;
};

type MaterialRequirement = {
  id: string;
  item: string;
  quantity: number | null;
  unit: string;
  notes?: string;
};

const STORAGE_METHODOLOGY_LIBRARY_DRAFTS = "synq_methodology_library_drafts";
const PENDING_LIBRARY_PREFILL_KEY = "synq_methodology_library_prefill_from_board_v1";

function safeParseArray(v: string | null): unknown[] {
  try {
    const j = JSON.parse(v ?? "[]");
    return Array.isArray(j) ? j : [];
  } catch {
    return [];
  }
}

function scopedKey(baseKey: string, clubScopeId: string): string {
  return `${baseKey}_${clubScopeId}`;
}

function loadEntries(key: string, legacyKey?: string): MethodologyLibraryEntry[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(key);
  if (raw) return safeParseArray(raw) as MethodologyLibraryEntry[];
  if (!legacyKey) return [];
  const legacyRaw = localStorage.getItem(legacyKey);
  if (!legacyRaw) return [];
  const parsed = safeParseArray(legacyRaw) as MethodologyLibraryEntry[];
  localStorage.setItem(key, JSON.stringify(parsed.slice(0, 300)));
  return parsed;
}

function saveEntries(key: string, entries: MethodologyLibraryEntry[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(entries.slice(0, 300)));
}

function parseMaterialsFromEquipment(equipment?: string): MaterialRequirement[] {
  if (!equipment) return [];
  const raw = equipment.trim();
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    // Normalizamos lo mínimo esperado
    return (parsed as any[])
      .map((r) => ({
        id: typeof r?.id === "string" ? r.id : `mat-${Date.now()}`,
        item: typeof r?.item === "string" ? r.item : String(r?.item ?? "").trim(),
        quantity: r?.quantity === null || r?.quantity === undefined || r?.quantity === "" ? null : Number(r.quantity),
        unit: typeof r?.unit === "string" && r.unit.trim() ? r.unit : "ud",
        notes: typeof r?.notes === "string" ? r.notes : undefined,
      }))
      .filter((r) => r.item.trim().length > 0);
  } catch {
    // Backward compat: texto libre (no estructurado). Lo guardamos como 1 sola fila.
    return [
      {
        id: `mat-${Date.now()}`,
        item: raw,
        quantity: null,
        unit: "ud",
      },
    ];
  }
}

export default function ExerciseLibraryPage() {
  const { toast } = useToast();
  const { profile, session } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<MethodologyLibraryEntry[]>([]);
  const [syncMode, setSyncMode] = useState<"remote" | "local" | "restricted">("local");
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>(STAGES[0] ?? "Debutantes");
  const clubScopeId = profile?.clubId ?? "global-hq";
  const neuralStorageKey = scopedKey(STORAGE_METHODOLOGY_NEURAL, clubScopeId);
  const draftStorageKey = scopedKey(STORAGE_METHODOLOGY_LIBRARY_DRAFTS, clubScopeId);
  const prefillStorageKey = scopedKey(PENDING_LIBRARY_PREFILL_KEY, clubScopeId);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const loadFromApiOrLocal = async () => {
      const localOfficial = loadEntries(neuralStorageKey, STORAGE_METHODOLOGY_NEURAL);
      const localDraft = loadEntries(draftStorageKey, STORAGE_METHODOLOGY_LIBRARY_DRAFTS);
      const localCombined = [...localOfficial, ...localDraft].sort((a, b) =>
        String(b.savedAt).localeCompare(String(a.savedAt), "es"),
      );

      if (!session?.access_token) {
        setEntries(localCombined);
        setSyncMode("local");
        return;
      }

      try {
        const res = await fetch("/api/club/methodology-library", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.status === 403) {
          setEntries([]);
          setSyncMode("restricted");
          return;
        }
        if (!res.ok) {
          setEntries(localCombined);
          setSyncMode("local");
          return;
        }
        const data = (await res.json()) as { tasks?: MethodologyLibraryEntry[] };
        const remote = Array.isArray(data?.tasks) ? data.tasks : [];
        setEntries(remote);
        setSyncMode("remote");
      } catch {
        setEntries(localCombined);
        setSyncMode("local");
      }
    };
    void loadFromApiOrLocal();
  }, [session?.access_token, draftStorageKey, neuralStorageKey]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const exercisePerms = useClubModulePermissions("exercises");
  const isElevated = profile?.role === "superadmin" || profile?.role === "club_admin";
  const canEditContent = isElevated || exercisePerms.canEdit;
  const canDeleteContent = isElevated || exercisePerms.canDelete;

  const [materials, setMaterials] = useState<MaterialRequirement[]>([]);
  const [materialDraft, setMaterialDraft] = useState({
    item: "",
    quantity: "",
    unit: "ud",
    notes: "",
  });

  const [formData, setFormData] = useState({
    title: "",
    didacticStrategy: "",
    objectives: "",
    conditionalContent: "",
    time: "",
    space: "",
    gameSituation: "",
    technicalAction: "",
    tacticalAction: "",
    collectiveContent: "",
    description: "",
    provocationRules: "",
    instructions: "",
    equipment: "",
    stage: STAGES[0] ?? "Debutantes",
    dimension: "Táctica",
    photoUrl: "",
    videoUrl: "",
  });

  const [boardElements, setBoardElements] = useState<unknown[]>([]);
  const [boardFieldType, setBoardFieldType] = useState<string>("f11");
  const [boardShowLanes, setBoardShowLanes] = useState<boolean>(false);
  const [boardIsHalfField, setBoardIsHalfField] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw =
      localStorage.getItem(prefillStorageKey) ??
      localStorage.getItem(PENDING_LIBRARY_PREFILL_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as {
        kind?: string;
        editingId?: string | null;
        stage?: string;
        dimension?: string;
        title?: string;
        objectives?: string;
        description?: string;
        photoUrl?: string;
        videoUrl?: string;
        elements?: unknown[];
        board?: {
          fieldType?: string;
          showLanes?: boolean;
          isHalfField?: boolean;
        };
        materials?: Array<{ id?: string; item: string; quantity: number | null; unit: string; notes?: string }>;
      };

      if (parsed.kind !== PENDING_LIBRARY_PREFILL_KEY) return;

      const nextStage =
        parsed.stage && typeof parsed.stage === "string"
          ? parsed.stage
          : (STAGES[0] ?? "Debutantes");

      setSelectedStageFilter(nextStage);
      setEditingId((parsed.editingId ?? null) as string | null);
      const rawMats = Array.isArray(parsed.materials) ? parsed.materials : [];
      setMaterials(
        rawMats.map((m, idx) => ({
          id: typeof m.id === "string" && m.id.length > 0 ? m.id : `prefill-mat-${idx}-${Date.now()}`,
          item: m.item ?? "",
          quantity: m.quantity ?? null,
          unit: m.unit ?? "",
          notes: m.notes,
        })),
      );
      setBoardElements(Array.isArray(parsed.elements) ? parsed.elements : []);
      setBoardFieldType(parsed.board?.fieldType ?? "f11");
      setBoardShowLanes(Boolean(parsed.board?.showLanes));
      setBoardIsHalfField(Boolean(parsed.board?.isHalfField));

      setFormData({
        title: parsed.title ?? "",
        didacticStrategy: "",
        objectives: parsed.objectives ?? "",
        conditionalContent: "",
        time: "",
        space: "",
        gameSituation: "",
        technicalAction: "",
        tacticalAction: "",
        collectiveContent: "",
        description: parsed.description ?? "",
        provocationRules: "",
        instructions: "",
        equipment: "",
        stage: nextStage,
        dimension: parsed.dimension ?? "Táctica",
        photoUrl: parsed.photoUrl ?? "",
        videoUrl: parsed.videoUrl ?? "",
      });

      setIsSheetOpen(true);
      toast({
        title: "TAREA_MAESTRA_PREFILL",
        description: "Captura lista para guardar en la biblioteca.",
      });
    } catch {
      // El prefill es opcional: evitamos romper la UI si el payload está mal.
    } finally {
      localStorage.removeItem(prefillStorageKey);
      localStorage.removeItem(PENDING_LIBRARY_PREFILL_KEY);
    }
  }, [prefillStorageKey, toast]);

  const allEntries = useMemo(
    () =>
      [...entries].sort((a, b) => String(b.savedAt).localeCompare(String(a.savedAt), "es")),
    [entries],
  );
  const officialEntries = useMemo(() => allEntries.filter((e) => e.status === "Official"), [allEntries]);
  const draftEntries = useMemo(() => allEntries.filter((e) => e.status !== "Official"), [allEntries]);

  const filteredEntries = allEntries.filter((e) => {
    const q = searchTerm.trim().toLowerCase();
    const matchesQ =
      !q ||
      e.title.toLowerCase().includes(q) ||
      (e.authorName ?? "").toLowerCase().includes(q) ||
      (e.dimension ?? "").toLowerCase().includes(q);
    const matchesStage = e.stage === selectedStageFilter;
    return matchesQ && matchesStage;
  });

  const statValidated = officialEntries.filter((e) => e.stage === selectedStageFilter).length;
  const statDrafts = draftEntries.filter((e) => e.stage === selectedStageFilter).length;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveMasterTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditContent) {
      toast({
        variant: "destructive",
        title: "SIN_PERMISOS",
        description: "Tu rol no puede editar la biblioteca de ejercicios (matriz del club).",
      });
      return;
    }
    if (!formData.title.trim()) {
      toast({
        variant: "destructive",
        title: "TÍTULO_REQUERIDO",
        description: "Asigna un título antes de guardar en el almacén neural.",
      });
      return;
    }
    if (!formData.stage?.trim()) {
      toast({
        variant: "destructive",
        title: "ETAPA_REQUERIDA",
        description: "Selecciona una categoría/etapa para clasificar la tarea.",
      });
      return;
    }
    setLoading(true);
    try {
      const now = new Date().toISOString();
      const nextId = editingId ?? `meth-${Date.now()}`;
      const materialsJson = materials.length > 0 ? JSON.stringify(materials) : "";
      const base: MethodologyLibraryEntry = {
        id: nextId,
        savedAt: now,
        status: "Draft",
        stage: formData.stage,
        dimension: formData.dimension,
        title: formData.title,
        authorName: (profile?.name ?? profile?.email ?? "Director").toString(),
        didacticStrategy: formData.didacticStrategy,
        objectives: formData.objectives,
        conditionalContent: formData.conditionalContent,
        time: formData.time,
        space: formData.space,
        gameSituation: formData.gameSituation,
        technicalAction: formData.technicalAction,
        tacticalAction: formData.tacticalAction,
        collectiveContent: formData.collectiveContent,
        description: formData.description,
        provocationRules: formData.provocationRules,
        instructions: formData.instructions,
        equipment: materialsJson,
        photoUrl: formData.photoUrl,
        videoUrl: formData.videoUrl,
        elements: boardElements.length > 0 ? boardElements : undefined,
        boardCoordSpace: boardElements.length > 0 ? "canvas_normalized_v1" : undefined,
        board: {
          fieldType: boardFieldType,
          showLanes: boardShowLanes,
          isHalfField: boardIsHalfField,
        },
      };

      const drafts = loadEntries(draftStorageKey, STORAGE_METHODOLOGY_LIBRARY_DRAFTS);
      const nextDrafts = editingId ? drafts.map((d) => (d.id === editingId ? base : d)) : [base, ...drafts];
      saveEntries(draftStorageKey, nextDrafts);

      if (session?.access_token) {
        if (editingId) {
          await fetch(`/api/club/methodology-library/${editingId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              status: "Draft",
              stage: base.stage,
              dimension: base.dimension,
              title: base.title,
              authorName: base.authorName,
              didacticStrategy: base.didacticStrategy,
              objectives: base.objectives,
              conditionalContent: base.conditionalContent,
              time: base.time,
              space: base.space,
              gameSituation: base.gameSituation,
              technicalAction: base.technicalAction,
              tacticalAction: base.tacticalAction,
              collectiveContent: base.collectiveContent,
              description: base.description,
              provocationRules: base.provocationRules,
              instructions: base.instructions,
              equipment: base.equipment,
              photoUrl: base.photoUrl,
              videoUrl: base.videoUrl,
              elements: base.elements,
              board: base.board,
              boardCoordSpace: base.boardCoordSpace,
            }),
          });
        } else {
          await fetch("/api/club/methodology-library", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              id: nextId,
              status: "Draft",
              stage: base.stage,
              dimension: base.dimension,
              title: base.title,
              authorName: base.authorName,
              didacticStrategy: base.didacticStrategy,
              objectives: base.objectives,
              conditionalContent: base.conditionalContent,
              time: base.time,
              space: base.space,
              gameSituation: base.gameSituation,
              technicalAction: base.technicalAction,
              tacticalAction: base.tacticalAction,
              collectiveContent: base.collectiveContent,
              description: base.description,
              provocationRules: base.provocationRules,
              instructions: base.instructions,
              equipment: base.equipment,
              photoUrl: base.photoUrl,
              videoUrl: base.videoUrl,
              elements: base.elements,
              board: base.board,
              boardCoordSpace: base.boardCoordSpace,
            }),
          });
        }
      }

      setEntries((prev) => {
        const without = prev.filter((x) => x.id !== nextId);
        return [{ ...base }, ...without];
      });

      // Importante para que el "editar en pizarra" apunte al mismo id tras crear.
      setEditingId(nextId);

      setIsSheetOpen(false);
      toast({
        title: "TAREA_MAESTRA_SINCRO",
        description: `Guardado como BORRADOR en biblioteca (${formData.stage}). Publícalo para alimentar el almacén neural.`,
      });
    } catch {
      toast({
        variant: "destructive",
        title: "ERROR_DE_GUARDADO",
        description: "No se pudo escribir en el almacén local.",
      });
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setMaterials([]);
    setBoardElements([]);
    setBoardFieldType("f11");
    setBoardShowLanes(false);
    setBoardIsHalfField(false);
    setMaterialDraft({ item: "", quantity: "", unit: "ud", notes: "" });
    setFormData({
      title: "",
      didacticStrategy: "",
      objectives: "",
      conditionalContent: "",
      time: "",
      space: "",
      gameSituation: "",
      technicalAction: "",
      tacticalAction: "",
      collectiveContent: "",
      description: "",
      provocationRules: "",
      instructions: "",
      equipment: "",
      stage: selectedStageFilter,
      dimension: "Táctica",
      photoUrl: "",
      videoUrl: "",
    });
    setIsSheetOpen(true);
  };

  const openEdit = (entry: MethodologyLibraryEntry) => {
    setEditingId(entry.id);
    setMaterials(parseMaterialsFromEquipment(entry.equipment));
    setBoardElements(Array.isArray(entry.elements) ? entry.elements : []);
    setBoardFieldType(entry.board?.fieldType ?? "f11");
    setBoardShowLanes(Boolean(entry.board?.showLanes));
    setBoardIsHalfField(Boolean(entry.board?.isHalfField));
    setMaterialDraft({ item: "", quantity: "", unit: "ud", notes: "" });
    setFormData({
      title: entry.title ?? "",
      didacticStrategy: entry.didacticStrategy ?? "",
      objectives: entry.objectives ?? "",
      conditionalContent: entry.conditionalContent ?? "",
      time: entry.time ?? "",
      space: entry.space ?? "",
      gameSituation: entry.gameSituation ?? "",
      technicalAction: entry.technicalAction ?? "",
      tacticalAction: entry.tacticalAction ?? "",
      collectiveContent: entry.collectiveContent ?? "",
      description: entry.description ?? "",
      provocationRules: entry.provocationRules ?? "",
      instructions: entry.instructions ?? "",
      equipment: entry.equipment ?? "",
      stage: entry.stage ?? selectedStageFilter,
      dimension: entry.dimension ?? "Táctica",
      photoUrl: entry.photoUrl ?? "",
      videoUrl: entry.videoUrl ?? "",
    });
    setIsSheetOpen(true);
  };

  const handlePublish = async (entry: MethodologyLibraryEntry) => {
    if (!canEditContent) {
      toast({ variant: "destructive", title: "SIN_PERMISOS", description: "No puedes publicar según la matriz del club." });
      return;
    }
    const drafts = loadEntries(draftStorageKey, STORAGE_METHODOLOGY_LIBRARY_DRAFTS).filter((d) => d.id !== entry.id);
    saveEntries(draftStorageKey, drafts);
    const official = loadEntries(neuralStorageKey, STORAGE_METHODOLOGY_NEURAL);
    const nextOfficial: MethodologyLibraryEntry[] = [
      { ...entry, status: "Official", savedAt: new Date().toISOString() },
      ...official.filter((o) => o.id !== entry.id),
    ];
    saveEntries(neuralStorageKey, nextOfficial);
    if (session?.access_token) {
      await fetch(`/api/club/methodology-library/${entry.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ status: "Official" }),
      });
    }
    setEntries((prev) =>
      prev.map((x) =>
        x.id === entry.id ? { ...x, status: "Official", savedAt: new Date().toISOString() } : x,
      ),
    );
    toast({ title: "PUBLICADO", description: `Ahora alimenta el almacén neural (${entry.stage}).` });
  };

  const handleDelete = async (entry: MethodologyLibraryEntry) => {
    if (!canDeleteContent) {
      toast({ variant: "destructive", title: "SIN_PERMISOS", description: "No puedes eliminar según la matriz del club." });
      return;
    }
    if (!confirm(`¿Eliminar \"${entry.title}\"?`)) return;
    const key = entry.status === "Official" ? neuralStorageKey : draftStorageKey;
    const legacyKey =
      entry.status === "Official" ? STORAGE_METHODOLOGY_NEURAL : STORAGE_METHODOLOGY_LIBRARY_DRAFTS;
    const next = loadEntries(key, legacyKey).filter((x) => x.id !== entry.id);
    saveEntries(key, next);
    if (session?.access_token) {
      await fetch(`/api/club/methodology-library/${entry.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
    }
    setEntries((prev) => prev.filter((x) => x.id !== entry.id));
    toast({ title: "ELIMINADO", description: entry.title });
  };

  const canModifyPizarra = Boolean(editingId && boardElements.length > 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 p-8 lg:p-12">
      <div className="flex justify-between items-end border-b border-white/5 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <Library className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-[10px] font-black text-primary/80 tracking-[0.5em] uppercase italic">Club_Tactical_Stylebook</span>
          </div>
          <h1 className="text-4xl font-headline font-black text-white uppercase tracking-tighter italic cyan-text-glow leading-none">
            BIBLIOTECA_OFICIAL
          </h1>
          <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mt-2">
            Modo:
            {" "}
            {syncMode === "remote"
              ? "SINCRO_SUPABASE"
              : syncMode === "restricted"
                ? "ACCESO_RESTRINGIDO"
                : "FALLBACK_LOCAL"}
          </p>
        </div>
        
        <Button 
          onClick={openCreate}
          disabled={!canEditContent}
          className="rounded-2xl bg-primary text-black font-black uppercase text-[10px] tracking-widest h-12 px-8 shadow-[0_0_20px_rgba(0,242,255,0.3)] hover:scale-105 transition-all border-none"
        >
          <Plus className="h-4 w-4 mr-2" /> Crear Tarea Maestra
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <LibraryStat label="Tareas Oficiales (etapa)" value={String(statValidated)} icon={ShieldCheck} highlight />
        <LibraryStat label="Borradores (etapa)" value={String(statDrafts)} icon={Activity} />
        <LibraryStat label="Etapa activa" value={selectedStageFilter} icon={Info} />
      </div>

      <Card className="glass-panel border-primary/20 bg-black/40 overflow-hidden shadow-2xl rounded-3xl">
        <CardHeader className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-4 h-4 w-4 text-primary/70 opacity-70" />
            <Input 
              placeholder="BUSCAR EN EL LIBRO DE ESTILO..." 
              className="pl-12 h-14 bg-black/40 border-primary/20 rounded-2xl text-primary font-bold uppercase text-[10px] tracking-widest focus-visible:ring-primary/40 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-6">
             <Select value={selectedStageFilter} onValueChange={setSelectedStageFilter}>
               <SelectTrigger className="h-14 bg-black/40 border-primary/20 rounded-2xl text-white font-bold uppercase text-[10px] focus:ring-primary/30 w-[210px]">
                 <SelectValue />
               </SelectTrigger>
               <SelectContent className="bg-[#0a0f18] border-primary/20 rounded-xl">
                 {STAGES.map((s) => (
                   <SelectItem key={s} value={s} className="text-[10px] font-black uppercase">
                     {s}
                   </SelectItem>
                 ))}
               </SelectContent>
             </Select>
             <div className="flex flex-col items-end">
                <span className="text-[9px] font-black text-primary/40 uppercase tracking-widest italic">Control de Acceso Metodológico</span>
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">SINCRO_CLUB_MASTER</span>
             </div>
             <Filter className="h-5 w-5 text-primary/40 cursor-pointer hover:text-primary" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white/[0.02]">
              <TableRow className="border-white/5">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-primary/40 text-left">Título de la Tarea / Autor</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-primary/40 text-center">Etapa Objetivada</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-primary/40 text-center">Dimensión</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-primary/40 text-center">Estado</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-primary/40 text-right">Acciones</th>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map((ex) => (
                <TableRow key={ex.id} className="border-white/5 hover:bg-primary/[0.03] transition-colors group">
                  <TableCell className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-all">
                        <Library className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-black text-white uppercase text-xs italic group-hover:cyan-text-glow transition-all">{ex.title}</p>
                        <p className="text-[8px] text-primary/40 font-bold uppercase tracking-widest mt-1">Por: {ex.authorName} • {String(ex.savedAt).slice(0, 10)}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="rounded-lg border-primary/20 text-primary text-[8px] font-black px-3 py-1 uppercase">{ex.stage}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest italic">{ex.dimension}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                       <div className={cn("h-1.5 w-1.5 rounded-full", ex.status === 'Official' ? 'bg-primary shadow-[0_0_8px_rgba(0,242,255,0.45)]' : 'bg-white/20')} />
                       <span className={cn("text-[9px] font-black uppercase", ex.status === 'Official' ? 'text-primary' : 'text-white/20')}>{ex.status}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      {canEditContent && ex.status === "Draft" && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-primary/40 hover:text-primary border border-white/5 rounded-xl"
                          onClick={() => handlePublish(ex)}
                          title="Publicar (alimenta almacén neural)"
                        >
                          <ShieldCheck className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-primary/40 hover:text-primary border border-white/5 rounded-xl"
                        onClick={() => openEdit(ex)}
                        disabled={!canEditContent && ex.status === "Official"}
                        title={canEditContent ? "Editar" : "Ver"}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-rose-500/40 hover:text-rose-500 border border-white/5 rounded-xl"
                        onClick={() => handleDelete(ex)}
                        disabled={!canDeleteContent}
                        title="Eliminar"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <div className="p-6 bg-black/40 border-t border-white/5 flex justify-between items-center text-[9px] font-black text-primary/20 uppercase tracking-[0.5em] rounded-b-3xl">
          <span className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 animate-pulse" /> Sincronización de Estilo: Activa</span>
          <span>Modelo de Blindaje v6.3</span>
        </div>
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent
          side="right"
          className="glass-panel bg-black/40 backdrop-blur-3xl border-l border-primary/20 text-white w-full sm:max-w-4xl lg:max-w-5xl p-0 overflow-hidden flex flex-col shadow-[-20px_0_60px_rgba(0,0,0,0.8)]"
        >
          <div className="p-10 border-b border-white/5 bg-black/40">
            <SheetHeader className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">Master_Asset_Factory_v9.7.1</span>
              </div>
              <SheetTitle className="text-4xl font-black italic tracking-tighter text-white uppercase text-left leading-none">
                CREAR <span className="text-primary">TAREA MAESTRA</span>
              </SheetTitle>
            </SheetHeader>
          </div>

          <form onSubmit={handleSaveMasterTask} className="flex-1 overflow-y-auto custom-scrollbar p-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              
              {/* COLUMNA 1: IDENTIDAD Y ASSET VISUAL */}
              <div className="space-y-10">
                <div className="p-8 bg-black/40 border border-primary/20 rounded-[2.5rem] space-y-8 relative overflow-hidden">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">Título de la Tarea</Label>
                    <Input 
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value.toUpperCase()})}
                      placeholder="EJ: JUEGO DE POSICIÓN 4X4+3" 
                      className="h-14 bg-black/40 border-primary/20 rounded-2xl font-bold uppercase focus:border-primary text-primary text-lg placeholder:text-primary/10" 
                    />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">Miniatura / Captura Técnica</Label>
                    <div className="relative aspect-video rounded-3xl border-2 border-dashed border-primary/20 bg-black/60 group cursor-pointer hover:border-primary/40 transition-all flex flex-col items-center justify-center overflow-hidden">
                      {formData.photoUrl ? (
                        <div className="relative h-full w-full">
                          <Image src={formData.photoUrl} alt="Preview" fill className="object-cover" />
                          <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setFormData({...formData, photoUrl: ""}); }}
                            className="absolute top-4 right-4 h-8 w-8 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-rose-500 transition-colors z-20"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                          <div className="h-14 w-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Camera className="h-6 w-6 text-primary/40" />
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-widest text-primary/40">Subir Digital Asset</span>
                        </div>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                        onChange={handlePhotoUpload}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">
                      Vídeo (YouTube/Vimeo)
                    </Label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Input
                        value={formData.videoUrl}
                        onChange={(e) =>
                          setFormData({ ...formData, videoUrl: e.target.value })
                        }
                        placeholder="https://www.youtube.com/watch?v=... o https://vimeo.com/..."
                        className="h-14 bg-black/40 border-primary/20 rounded-2xl font-bold text-white/80 placeholder:text-white/10"
                      />
                    <Button
                        type="button"
                        variant="outline"
                        disabled={!formData.videoUrl.trim()}
                        onClick={() => {
                          const url = formData.videoUrl.trim();
                          if (!url) return;
                          window.open(url, "_blank", "noopener,noreferrer");
                        }}
                      className="h-14 rounded-2xl border-primary/20 text-primary hover:bg-primary/10 font-black uppercase text-[10px] tracking-widest px-6 disabled:opacity-40"
                      >
                        Ver
                      </Button>
                    </div>
                    <p className="text-[9px] font-bold text-white/25">
                      Campo opcional. Se valida al guardar en red (solo YouTube/Vimeo).
                    </p>
                  </div>

                  {canModifyPizarra ? (
                    <Button
                      type="button"
                      asChild
                      className="w-full h-16 bg-primary/5 border border-primary/20 text-primary font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-primary hover:text-black transition-all flex items-center justify-center gap-3"
                    >
                      <Link
                        href={`/board/training?source=form&editId=${encodeURIComponent(
                          editingId as string,
                        )}&title=${encodeURIComponent(formData.title)}&stage=${encodeURIComponent(
                          formData.stage,
                        )}&dimension=${encodeURIComponent(
                          formData.dimension,
                        )}&objective=${encodeURIComponent(
                          formData.objectives,
                        )}&description=${encodeURIComponent(
                          formData.description,
                        )}&boardFieldType=${encodeURIComponent(
                          boardFieldType,
                        )}&boardShowLanes=${boardShowLanes ? "1" : "0"}&boardIsHalfField=${
                          boardIsHalfField ? "1" : "0"
                        }`}
                      >
                        <PencilLine className="h-4 w-4" /> MODIFICAR PIZARRA
                      </Link>
                    </Button>
                  ) : (
                  <Button 
                    type="button"
                    asChild
                    className="w-full h-16 bg-primary/5 border border-primary/20 text-primary font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-primary hover:text-black transition-all flex items-center justify-center gap-3"
                  >
                      <Link
                        href={`/board/training?source=form&title=${encodeURIComponent(
                          formData.title,
                        )}&stage=${encodeURIComponent(formData.stage)}&dimension=${encodeURIComponent(
                          formData.dimension,
                        )}&objective=${encodeURIComponent(
                          formData.objectives,
                        )}&description=${encodeURIComponent(
                          formData.description,
                        )}&boardFieldType=${encodeURIComponent(
                          boardFieldType,
                        )}&boardShowLanes=${boardShowLanes ? "1" : "0"}&boardIsHalfField=${
                          boardIsHalfField ? "1" : "0"
                        }`}
                      >
                      <PencilLine className="h-4 w-4" /> DISEÑAR EN PIZARRA DE ÉLITE
                    </Link>
                  </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">Etapa Federativa</Label>
                    <Select value={formData.stage} onValueChange={(v) => setFormData({...formData, stage: v})}>
                      <SelectTrigger className="h-14 bg-black/40 border-primary/20 rounded-2xl text-white font-bold uppercase text-[10px] focus:ring-primary/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a0f18] border-primary/20 rounded-xl">
                        {STAGES.map(s => (
                          <SelectItem key={s} value={s} className="text-[10px] font-black uppercase">{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">Dimensión</Label>
                    <Select value={formData.dimension} onValueChange={(v) => setFormData({...formData, dimension: v})}>
                      <SelectTrigger className="h-14 bg-black/40 border-primary/20 rounded-2xl text-white font-bold uppercase text-[10px] focus:ring-primary/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a0f18] border-primary/20 rounded-xl">
                        <SelectItem value="Táctica" className="text-[10px] font-black uppercase">Táctica</SelectItem>
                        <SelectItem value="Técnica" className="text-[10px] font-black uppercase">Técnica</SelectItem>
                        <SelectItem value="Física" className="text-[10px] font-black uppercase">Física</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">Estrategia Didáctica</Label>
                  <Input 
                    value={formData.didacticStrategy}
                    onChange={(e) => setFormData({...formData, didacticStrategy: e.target.value.toUpperCase()})}
                    placeholder="EJ: JUEGO ADAPTADO" 
                    className="h-14 bg-black/40 border-primary/20 rounded-2xl font-bold uppercase focus:border-primary text-primary placeholder:text-primary/10" 
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">Objetivos Principales</Label>
                  <Textarea 
                    value={formData.objectives}
                    onChange={(e) => setFormData({...formData, objectives: e.target.value})}
                    placeholder="EJ: MEJORAR LA VISIÓN DE JUEGO..." 
                    className="min-h-[120px] bg-black/40 border-primary/20 rounded-2xl font-bold text-primary placeholder:text-primary/10" 
                  />
                </div>
              </div>

              {/* COLUMNA 2: DETALLES TÉCNICOS Y MECÁNICA */}
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">Tiempo (Min)</Label>
                    <Input 
                      type="number"
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                      placeholder="15" 
                      className="h-14 bg-black/40 border-primary/20 rounded-2xl font-bold text-primary" 
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">Espacio / Dimensiones</Label>
                    <Input 
                      value={formData.space}
                      onChange={(e) => setFormData({...formData, space: e.target.value})}
                      placeholder="EJ: 30X20M" 
                      className="h-14 bg-black/40 border-primary/20 rounded-2xl font-bold text-primary" 
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">Situación de Juego</Label>
                  <Input 
                    value={formData.gameSituation}
                    onChange={(e) => setFormData({...formData, gameSituation: e.target.value})}
                    placeholder="EJ: 4X4 CON 2 COMODINES" 
                    className="h-14 bg-black/40 border-primary/20 rounded-2xl font-bold text-primary" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">Acción Técnica</Label>
                    <Input 
                      value={formData.technicalAction}
                      onChange={(e) => setFormData({...formData, technicalAction: e.target.value})}
                      placeholder="EJ: CONTROL ORIENTADO" 
                      className="h-14 bg-black/40 border-primary/20 rounded-2xl font-bold text-primary" 
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">Acción Táctica</Label>
                    <Input 
                      value={formData.tacticalAction}
                      onChange={(e) => setFormData({...formData, tacticalAction: e.target.value})}
                      placeholder="EJ: APOYO" 
                      className="h-14 bg-black/40 border-primary/20 rounded-2xl font-bold text-primary" 
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">Descripción Detallada</Label>
                  <Textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="EXPLIQUE LA DINÁMICA DEL EJERCICIO..." 
                    className="min-h-[120px] bg-black/40 border-primary/20 rounded-2xl font-bold text-primary" 
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">Normas de Provocación</Label>
                  <Textarea 
                    value={formData.provocationRules}
                    onChange={(e) => setFormData({...formData, provocationRules: e.target.value})}
                    placeholder="EJ: TOQUES LIMITADOS, PUNTUACIÓN DOBLE..." 
                    className="min-h-[100px] bg-black/40 border-primary/20 rounded-2xl font-bold text-primary" 
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">Consignas para el Entrenador</Label>
                  <Textarea 
                    value={formData.instructions}
                    onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                    placeholder="PUNTOS CLAVE DE CORRECCIÓN..." 
                    className="min-h-[100px] bg-black/40 border-primary/20 rounded-2xl font-bold text-primary" 
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">
                    Material Necesario (inventario)
                  </Label>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">
                        Material
                      </Label>
                      <Input
                        value={materialDraft.item}
                        onChange={(e) =>
                          setMaterialDraft((d) => ({ ...d, item: e.target.value.toUpperCase() }))
                        }
                        placeholder="EJ: BALONES"
                        className="h-12 bg-black/40 border-primary/20 rounded-2xl font-bold text-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">
                        Cantidad
                      </Label>
                      <Input
                        type="number"
                        min={0}
                        value={materialDraft.quantity}
                        onChange={(e) => setMaterialDraft((d) => ({ ...d, quantity: e.target.value }))}
                        placeholder="EJ: 10"
                        className="h-12 bg-black/40 border-primary/20 rounded-2xl font-bold text-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">
                        Unidad
                      </Label>
                      <Input
                        value={materialDraft.unit}
                        onChange={(e) => setMaterialDraft((d) => ({ ...d, unit: e.target.value.toUpperCase() }))}
                        placeholder="ud"
                        className="h-12 bg-black/40 border-primary/20 rounded-2xl font-bold text-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">
                      Nota (opcional)
                    </Label>
                  <Input 
                      value={materialDraft.notes}
                      onChange={(e) => setMaterialDraft((d) => ({ ...d, notes: e.target.value }))}
                      placeholder="EJ: tamaño 4, marca X, etc."
                      className="h-12 bg-black/40 border-primary/20 rounded-2xl font-bold text-primary"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      onClick={() => {
                        const item = materialDraft.item.trim();
                        if (!item) {
                          toast({ variant: "destructive", title: "MATERIAL_REQUERIDO", description: "Indica el nombre del material." });
                          return;
                        }
                        const qtyStr = materialDraft.quantity.trim();
                        const quantity = qtyStr === "" ? null : Number(qtyStr);
                        const unit = materialDraft.unit.trim() || "ud";
                        if (quantity !== null && (Number.isNaN(quantity) || quantity < 0)) {
                          toast({ variant: "destructive", title: "CANTIDAD_INVALIDA", description: "Cantidad debe ser 0 o mayor." });
                          return;
                        }
                        const next: MaterialRequirement = {
                          id: `mat-${Date.now()}`,
                          item,
                          quantity,
                          unit,
                          notes: materialDraft.notes.trim() ? materialDraft.notes.trim() : undefined,
                        };
                        setMaterials((prev) => [next, ...prev]);
                        setMaterialDraft({ item: "", quantity: "", unit: "ud", notes: "" });
                      }}
                      className="h-12 rounded-2xl bg-primary text-black font-black uppercase text-[10px] tracking-widest px-6 hover:scale-[1.01] transition-all"
                    >
                      Añadir
                    </Button>
                    {materials.length > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setMaterials([])}
                        className="h-12 rounded-2xl border border-white/5 text-primary/70 font-black uppercase text-[10px] tracking-widest hover:bg-primary/10 hover:text-primary"
                      >
                        Limpiar
                      </Button>
                    )}
                  </div>

                  {materials.length > 0 && (
                    <div className="space-y-2 rounded-2xl border border-white/5 bg-black/30 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/40">
                          Lista
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-primary/50">
                          {materials.length} items
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {materials.map((m) => (
                          <span
                            key={m.id}
                            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-primary"
                          >
                            {m.quantity === null ? `${m.item}` : `${m.item} (${m.quantity} ${m.unit})`}
                            <button
                              type="button"
                              disabled={!canEditContent}
                              onClick={() => setMaterials((prev) => prev.filter((x) => x.id !== m.id))}
                              className="text-white/40 hover:text-rose-400 transition-colors disabled:opacity-30"
                              aria-label="Eliminar material"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>

          <div className="p-10 bg-black/60 border-t border-white/5 flex gap-6">
            <SheetClose asChild>
              <Button variant="ghost" className="flex-1 h-16 border border-primary/20 text-primary/60 font-black uppercase text-[11px] tracking-widest hover:bg-primary/10 rounded-2xl transition-all">
                CANCELAR
              </Button>
            </SheetClose>
            <Button 
              onClick={handleSaveMasterTask}
              disabled={loading || !canEditContent}
              className="flex-[2] h-16 bg-primary text-black font-black uppercase text-[11px] tracking-[0.3em] rounded-2xl cyan-glow hover:scale-[1.02] transition-all border-none"
            >
              {loading ? "BLINDANDO..." : "BLINDAR_TAREA_MAESTRA"} <ArrowRight className="h-4 w-4 ml-3" />
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function LibraryStat({ label, value, icon: Icon, highlight }: any) {
  return (
    <Card className="glass-panel p-6 border-primary/20 bg-black/20 rounded-[2rem] relative overflow-hidden group">
       <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all">
          <Icon className="h-16 w-16 text-primary" />
       </div>
       <div className="relative z-10 space-y-1">
          <p className="text-[10px] font-black text-primary uppercase tracking-widest italic">{label}</p>
          <p className={cn("text-3xl font-black italic tracking-tighter", highlight ? "text-primary cyan-text-glow" : "text-white")}>{value}</p>
       </div>
    </Card>
  );
}
