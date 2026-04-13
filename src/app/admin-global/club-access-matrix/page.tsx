"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Save, RefreshCw, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { AccessMatrixCuadroMando } from "@/components/admin/AccessMatrixCuadroMando";
import {
  buildDefaultStaffAccessMatrix,
  CLUB_MODULE_IDS_DISPLAY_ORDER,
  CLUB_MODULE_LABELS,
  CLUB_MODULE_UI_SECTIONS,
  normalizeStaffAccessMatrix,
  ROLES_TO_MANAGE,
  type ClubModuleId,
  type StaffAccessMatrix,
} from "@/lib/club-permissions";

type ClubRow = { id: string; name?: string | null };

export default function AdminGlobalClubAccessMatrixPage() {
  const { session } = useAuth();
  const { toast } = useToast();
  const [clubs, setClubs] = useState<ClubRow[]>([]);
  const [clubId, setClubId] = useState<string>("");
  const [working, setWorking] = useState<StaffAccessMatrix>({});
  const [loadingClubs, setLoadingClubs] = useState(true);
  const [loadingMatrix, setLoadingMatrix] = useState(false);
  const [saving, setSaving] = useState(false);

  const defaults = useMemo(() => buildDefaultStaffAccessMatrix(), []);
  const normalized = useMemo(() => normalizeStaffAccessMatrix(working, defaults), [working, defaults]);

  const loadClubs = useCallback(async () => {
    setLoadingClubs(true);
    try {
      if (!session?.access_token) {
        setClubs([]);
        return;
      }
      const res = await fetch("/api/admin/clubs", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const j = (await res.json()) as { clubs?: ClubRow[]; error?: string };
      if (!res.ok) throw new Error(j.error ?? String(res.status));
      setClubs(Array.isArray(j.clubs) ? j.clubs : []);
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: String(e) });
      setClubs([]);
    } finally {
      setLoadingClubs(false);
    }
  }, [session?.access_token, toast]);

  const loadMatrix = useCallback(async () => {
    if (!clubId || !session?.access_token) return;
    setLoadingMatrix(true);
    try {
      const res = await fetch(`/api/admin/club-staff-access-matrix?clubId=${encodeURIComponent(clubId)}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const j = (await res.json()) as { ok?: boolean; payload?: StaffAccessMatrix; error?: string };
      if (!res.ok) throw new Error(j.error ?? String(res.status));
      const payload = j.payload && typeof j.payload === "object" ? j.payload : {};
      setWorking(normalizeStaffAccessMatrix(payload as StaffAccessMatrix, defaults));
    } catch (e) {
      toast({ variant: "destructive", title: "Error cargando matriz", description: String(e) });
      setWorking(defaults);
    } finally {
      setLoadingMatrix(false);
    }
  }, [clubId, session?.access_token, defaults, toast]);

  useEffect(() => {
    void loadClubs();
  }, [loadClubs]);

  useEffect(() => {
    if (clubId) void loadMatrix();
  }, [clubId, loadMatrix]);

  const toggleAccess = (roleId: string, moduleId: ClubModuleId, checked: boolean) => {
    setWorking((prev) => {
      const merged = normalizeStaffAccessMatrix(prev, defaults);
      const base = merged[roleId];
      if (!base?.modules?.[moduleId]) return merged;
      const modules = { ...base.modules };
      const prevSt = modules[moduleId];
             modules[moduleId] = checked
        ? { ...prevSt, access: true, view: true }
        : { access: false, view: false, edit: false, delete: false };
      return { ...merged, [roleId]: { ...base, modules } };
    });
  };

  const handleSave = async () => {
    if (!clubId || !session?.access_token) return;
    setSaving(true);
    try {
      const snapshot = normalizeStaffAccessMatrix(working, defaults);
      const res = await fetch("/api/admin/club-staff-access-matrix", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ clubId, payload: snapshot }),
      });
      const j = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) throw new Error(j.error ?? String(res.status));
      toast({ title: "Matriz guardada", description: `Club ${clubId.slice(0, 8)}… actualizado.` });
    } catch (e) {
      toast({ variant: "destructive", title: "Error al guardar", description: String(e) });
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setWorking(buildDefaultStaffAccessMatrix());
    toast({ title: "Borrador local", description: "Restaurados valores por defecto en pantalla. Pulse Guardar para persistir." });
  };

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-emerald-500/20 pb-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 mb-2">
            <LayoutGrid className="h-5 w-5" />
            <span className="text-[10px] font-black uppercase tracking-[0.45em]">Núcleo_Global</span>
          </div>
          <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Cuadro matriz por club</h1>
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-2 max-w-2xl leading-relaxed">
            Misma política que <strong className="text-emerald-400">Admin &amp; Permisos</strong> del club: bloque operaciones y bloque metodología (ejercicios, planner, pizarras). Aquí solo el acceso rápido; en el dashboard del club están los cuatro toggles por módulo.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadClubs()}
            disabled={loadingClubs}
            className="border-emerald-500/30 text-emerald-400 uppercase text-[9px] font-black"
          >
            <RefreshCw className="h-3 w-3 mr-2" /> Clubs
          </Button>
          <Button
            size="sm"
            onClick={() => void handleSave()}
            disabled={!clubId || saving}
            className="bg-emerald-500 text-black uppercase text-[9px] font-black"
          >
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3 mr-2" />}
            Guardar
          </Button>
        </div>
      </div>

      <Card className="bg-black/50 border-emerald-500/20">
        <CardHeader>
          <CardTitle className="text-white text-lg uppercase italic">Club objetivo</CardTitle>
          <CardDescription className="text-[10px] font-bold uppercase text-white/40 tracking-widest">
            Listado desde Supabase (service role en API).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingClubs ? (
            <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
          ) : (
            <Select value={clubId || undefined} onValueChange={setClubId}>
              <SelectTrigger className="max-w-md bg-white/5 border-emerald-500/20 text-white">
                <SelectValue placeholder="Elegir club…" />
              </SelectTrigger>
              <SelectContent className="border-emerald-500/30 bg-[#04070c] text-white">
                {clubs.map((c) => (
                  <SelectItem key={c.id} value={c.id} className="text-[10px] font-mono uppercase text-white focus:bg-emerald-500 focus:text-black">
                    {(c.name || "Sin nombre").slice(0, 40)} — {c.id.slice(0, 8)}…
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button variant="ghost" size="sm" onClick={handleResetDefaults} className="text-amber-400 uppercase text-[9px] font-black">
            Restaurar borrador por defecto (local)
          </Button>
        </CardContent>
      </Card>

      {clubId && loadingMatrix ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-10 w-10 text-emerald-400 animate-spin" />
        </div>
      ) : clubId ? (
        <>
          <AccessMatrixCuadroMando matrix={normalized} theme="emerald" />
          <Card className="bg-black/40 border-emerald-500/15">
            <CardHeader>
              <CardTitle className="text-emerald-400 text-sm uppercase tracking-widest">Edición rápida — Acceder</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-[10px]">
                <thead>
                  <tr className="text-emerald-400/90 uppercase font-black border-b border-white/10">
                    <th rowSpan={2} className="p-2 align-bottom text-white/50">
                      Rol
                    </th>
                    {CLUB_MODULE_UI_SECTIONS.map((sec) => (
                      <th key={sec.id} colSpan={sec.modules.length} className="p-2 text-center border-l border-white/10">
                        {sec.title}
                      </th>
                    ))}
                  </tr>
                  <tr className="text-white/45 uppercase font-black border-b border-white/10 text-[9px]">
                    {CLUB_MODULE_IDS_DISPLAY_ORDER.map((mid) => (
                      <th key={mid} className="p-2 text-center border-l border-white/5 max-w-[100px] font-bold">
                        {CLUB_MODULE_LABELS[mid]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ROLES_TO_MANAGE.map((r) => (
                    <tr key={r.id} className="border-b border-white/5">
                      <td className="p-2 font-bold text-white/80">{r.label}</td>
                      {CLUB_MODULE_IDS_DISPLAY_ORDER.map((mid) => {
                        const on = normalized[r.id]?.modules?.[mid]?.access ?? false;
                        return (
                          <td key={mid} className="p-2 text-center">
                            <Checkbox checked={on} onCheckedChange={(v) => toggleAccess(r.id, mid, Boolean(v))} />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-[9px] text-white/30 mt-4 font-bold uppercase tracking-widest leading-relaxed">
                Metodología = ejercicios + planner + pizarras. Leyenda módulos:{" "}
                {CLUB_MODULE_IDS_DISPLAY_ORDER.map((id) => `${CLUB_MODULE_LABELS[id]}`).join(" · ")}
              </p>
            </CardContent>
          </Card>
        </>
      ) : (
        <p className="text-white/30 text-[10px] font-bold uppercase text-center py-12">Seleccione un club para cargar la matriz.</p>
      )}
    </div>
  );
}
