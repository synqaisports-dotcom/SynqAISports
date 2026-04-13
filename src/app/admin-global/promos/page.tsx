"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Zap,
  Plus,
  Search,
  BarChart3,
  QrCode,
  Users,
  Loader2,
  Sparkles,
  Copy,
  Target,
  Trash2,
  Download,
  Eye,
  Calendar,
  Clock,
  Hash,
  Layers,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  generatePromoCampaign,
  type GenerateCampaignInput,
  type GenerateCampaignOutput,
} from "@/ai/flows/generate-promo-campaign";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { QRCodeCanvas } from "qrcode.react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { PromoCampaign } from "@/lib/supabase";

const AVAILABLE_PLANS = [
  { id: "PROMO_LINK", name: "Promo Link — pizarra + cuota club al activar nodo" },
  { id: "VOLUMEN_CORE", name: "Volumen Core — suscripción B2B al club" },
  { id: "ENTERPRISE_SCALE", name: "Enterprise Scale — acuerdo por volumen con el club" },
];

const CHANNEL_OPTIONS: { value: GenerateCampaignInput["platform"]; label: string }[] = [
  { value: "Instagram Reels", label: "Instagram Reels" },
  { value: "TikTok", label: "TikTok" },
  { value: "YouTube Shorts", label: "YouTube Shorts" },
  { value: "YouTube", label: "YouTube" },
  { value: "Instagram", label: "Instagram" },
  { value: "Facebook", label: "Facebook" },
  { value: "LinkedIn", label: "LinkedIn" },
  { value: "Google Ads", label: "Google Ads" },
  { value: "Twitter/X", label: "Twitter / X" },
  { value: "Otro", label: "Otro" },
];

const COUNTRY_OPTIONS = [
  { code: "ALL", label: "Todos (ALL)" },
  { code: "ES", label: "España" },
  { code: "AR", label: "Argentina" },
  { code: "MX", label: "México" },
  { code: "CO", label: "Colombia" },
  { code: "US", label: "Estados Unidos" },
  { code: "GB", label: "Reino Unido" },
  { code: "IT", label: "Italia" },
  { code: "PT", label: "Portugal" },
  { code: "BR", label: "Brasil" },
  { code: "FR", label: "Francia" },
  { code: "DE", label: "Alemania" },
];

function formatDate(d: string | null): string {
  if (!d) return "—";
  return d.includes("T") ? d.split("T")[0]! : d.slice(0, 10);
}

const BrandedQR = ({ value, size = 280 }: { value: string; size?: number }) => (
  <div className="relative flex items-center justify-center overflow-hidden rounded-3xl border border-emerald-500/20 bg-black p-4 shadow-[0_0_50px_rgba(16,185,129,0.3)] group">
    <QRCodeCanvas
      value={value}
      size={size}
      level="H"
      fgColor="#10b981"
      bgColor="#000000"
      includeMargin={false}
    />
    <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-xl border-2 border-black bg-emerald-500 px-5 py-2.5 shadow-[0_0_30px_rgba(16,185,129,0.8)] transition-transform duration-500 group-hover:scale-110">
      <span className="text-[16px] font-black uppercase italic tracking-tighter text-black">SynQAI</span>
    </div>
    <div className="pointer-events-none absolute inset-0 bg-emerald-500/5 opacity-30 scan-line" />
  </div>
);

export default function GlobalPromosPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [result, setResult] = useState<GenerateCampaignOutput | null>(null);
  const [campaigns, setCampaigns] = useState<PromoCampaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<PromoCampaign | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [origin, setOrigin] = useState("");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    objective: "",
    platform: "Instagram Reels" as GenerateCampaignInput["platform"],
    planId: "PROMO_LINK",
    countryCode: "ALL",
    maxUses: "",
    expiryPeriod: "3_months",
  });

  useEffect(() => {
    setOrigin(typeof window !== "undefined" ? window.location.origin : "");
  }, []);

  const loadCampaigns = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setCampaigns([]);
      return;
    }
    setListLoading(true);
    try {
      const { data, error } = await supabase
        .from("promo_campaigns")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const rows = (data ?? []) as PromoCampaign[];
      setCampaigns(rows);
      setSelectedCampaign((prev) => {
        if (prev && rows.some((r) => r.id === prev.id)) {
          return rows.find((r) => r.id === prev.id) ?? rows[0] ?? null;
        }
        return rows[0] ?? null;
      });
    } catch (e) {
      console.error("[SynqAI] promo_campaigns:", e);
      toast({
        variant: "destructive",
        title: "SYNC_ERROR",
        description: "No se pudieron cargar las campañas. ¿Migración aplicada?",
      });
      setCampaigns([]);
    } finally {
      setListLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadCampaigns();
  }, [loadCampaigns]);

  const calculateExpiryDate = (period: string) => {
    const date = new Date();
    if (period === "1_month") date.setMonth(date.getMonth() + 1);
    else if (period === "3_months") date.setMonth(date.getMonth() + 3);
    else if (period === "6_months") date.setMonth(date.getMonth() + 6);
    else if (period === "1_year") date.setFullYear(date.getFullYear() + 1);
    return date.toISOString().split("T")[0]!;
  };

  const filteredCampaigns = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return campaigns;
    return campaigns.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.token.toLowerCase().includes(q) ||
        (c.plan_id ?? "").toLowerCase().includes(q),
    );
  }, [campaigns, searchTerm]);

  const stats = useMemo(() => {
    const active = campaigns.filter((c) => c.is_active).length;
    const scans = campaigns.reduce((s, c) => s + (c.scan_count ?? 0), 0);
    const withExpiry = campaigns
      .filter((c) => c.is_active && c.expires_at)
      .map((c) => new Date(c.expires_at!).getTime());
    const nextExpiry =
      withExpiry.length > 0
        ? new Date(Math.min(...withExpiry)).toISOString().split("T")[0]
        : "—";
    return { active, scans, nextExpiry };
  }, [campaigns]);

  const currentToken = selectedCampaign?.token ?? result?.suggestedPromoCode ?? null;
  const currentUrl =
    currentToken && origin ? `${origin}/login?t=${encodeURIComponent(currentToken)}` : "";

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.objective.trim()) {
      toast({ variant: "destructive", title: "ERROR_PARAMETROS", description: "Define un objetivo de captación." });
      return;
    }

    setLoading(true);
    const calculatedExpiry = calculateExpiryDate(formData.expiryPeriod);
    const expiresAtIso = `${calculatedExpiry}T23:59:59.999Z`;
    const maxUsesNum =
      formData.maxUses.trim() === "" ? null : parseInt(formData.maxUses, 10);
    if (formData.maxUses.trim() !== "" && (Number.isNaN(maxUsesNum) || (maxUsesNum ?? 0) < 1)) {
      toast({ variant: "destructive", title: "LÍMITE_INVÁLIDO", description: "Deja vacío para ilimitado o un entero ≥ 1." });
      setLoading(false);
      return;
    }

    try {
      const data = await generatePromoCampaign({
        objective: formData.objective,
        platform: formData.platform,
        planId: formData.planId,
        maxUses: maxUsesNum ?? undefined,
        expiryDate: calculatedExpiry,
      });
      setResult(data);

      if (isSupabaseConfigured && supabase) {
        const { error: insErr } = await supabase.from("promo_campaigns").insert({
          title: data.campaignTitle,
          token: data.suggestedPromoCode,
          plan_id: data.suggestedPlanId ?? formData.planId,
          country_code: formData.countryCode,
          channel: formData.platform,
          periodicity: formData.expiryPeriod,
          max_uses: maxUsesNum,
          expires_at: expiresAtIso,
          hook: data.mainHook,
          main_copy: data.socialMediaCopy,
          is_active: true,
          scan_count: 0,
        });
        if (insErr) {
          if (insErr.code === "23505") {
            toast({
              variant: "destructive",
              title: "TOKEN_DUPLICADO",
              description: "Regenera: ese token ya existe en base.",
            });
          } else {
            toast({ variant: "destructive", title: "BD_ERROR", description: insErr.message });
          }
          setLoading(false);
          return;
        }
        await loadCampaigns();
        toast({ title: "CAMPAÑA_GUARDADA", description: "Campaña persistida en Supabase." });
        setIsSheetOpen(false);
        setResult(null);
        setFormData((f) => ({ ...f, objective: "" }));
      } else {
        toast({
          title: "MODO_SIN_SUPABASE",
          description: "IA generada; configura Supabase y la migración promo para persistir.",
        });
      }
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "FALLO_MOTOR_IA", description: "Error en el generador." });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, row: PromoCampaign) => {
    e.stopPropagation();
    if (!isSupabaseConfigured || !supabase) return;
    if (!confirm(`¿Eliminar campaña "${row.title}"?`)) return;
    const { error } = await supabase.from("promo_campaigns").delete().eq("id", row.id);
    if (error) {
      toast({ variant: "destructive", title: "ERROR", description: error.message });
      return;
    }
    toast({ title: "CAMPAÑA_ELIMINADA", description: row.token });
    await loadCampaigns();
  };

  const copyLink = () => {
    if (!currentUrl) return;
    void navigator.clipboard.writeText(currentUrl);
    toast({ title: "LINK_COPIADO", description: "URL del magic link en portapapeles." });
  };

  const downloadQR = () => {
    const canvas = document.querySelector("canvas");
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `SynQAI_QR_${currentToken ?? "PROMO"}.png`;
      link.href = url;
      link.click();
    }
  };

  return (
    <div className="animate-in fade-in space-y-8 duration-1000">
      <div className="flex flex-col justify-between gap-4 border-b border-white/5 pb-6 sm:flex-row sm:items-end">
        <div className="space-y-1">
          <p className="text-[10px] uppercase font-black tracking-widest text-emerald-400/50">Home</p>
          <div className="mb-2 flex items-center gap-3">
            <QrCode className="h-5 w-5 animate-pulse text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-400">
              Magic_Link_Factory_v3
            </span>
          </div>
          <h1 className="font-headline text-4xl font-black uppercase italic tracking-tighter text-white emerald-text-glow">
            Dashboard_Promos
          </h1>
          <p className="max-w-xl text-[10px] font-bold uppercase tracking-widest text-white/35">
            Facturación B2B al club; los enlaces miden aperturas hasta Stripe y censo de atletas.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-12 rounded-2xl border-white/10 font-black uppercase text-[10px] tracking-widest"
            onClick={() => void loadCampaigns()}
            disabled={listLoading}
          >
            {listLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Refrescar
          </Button>
          <Button asChild variant="outline" className="h-12 rounded-2xl border-emerald-500/30 font-black uppercase text-[10px] tracking-widest text-emerald-300 hover:bg-emerald-500/10">
            <Link href="/admin-global/analytics">Analytics global</Link>
          </Button>
          <Button
            onClick={() => {
              setResult(null);
              setIsSheetOpen(true);
            }}
            className="h-12 rounded-2xl border-none bg-emerald-500 px-8 font-black uppercase text-[10px] tracking-widest text-black shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-[background-color,border-color,color,opacity,transform] hover:scale-105 active:scale-95"
          >
            <Plus className="mr-2 h-4 w-4" /> Crear Magic Link / QR
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <PromoMiniStat icon={Layers} label="Campañas activas" value={String(stats.active)} trend="BD" />
        <PromoMiniStat icon={Users} label="Escaneos / aperturas" value={String(stats.scans)} trend="RPC" />
        <PromoMiniStat icon={Calendar} label="Caducidad más próxima" value={stats.nextExpiry} trend="UTC" />
        <PromoMiniStat icon={BarChart3} label="Total campañas" value={String(campaigns.length)} trend="LIST" />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Card className="glass-panel relative col-span-1 overflow-hidden rounded-3xl border border-emerald-500/20 bg-slate-950/80 lg:col-span-2">
          <CardHeader className="flex flex-col gap-4 border-b border-white/5 p-6 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-emerald-400 opacity-50" />
              <Input
                placeholder="BUSCAR CAMPAÑA O TOKEN..."
                className="h-12 rounded-2xl border-emerald-500/20 bg-white/5 pl-10 font-bold uppercase text-[10px] tracking-widest text-white placeholder:text-white/20 focus-visible:ring-emerald-500/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-white/[0.02]">
                <TableRow className="border-white/5">
                  <TableHead className="h-14 pl-8 font-black text-[10px] uppercase tracking-widest text-white/40">
                    Campaña / Creación
                  </TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-white/40">
                    Token / Expiración
                  </TableHead>
                  <TableHead className="text-center font-black text-[10px] uppercase tracking-widest text-white/40">
                    Uso / Límite
                  </TableHead>
                  <TableHead className="pr-8 text-right font-black text-[10px] uppercase tracking-widest text-white/40">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listLoading && campaigns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-12 text-center">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-500" />
                    </TableCell>
                  </TableRow>
                ) : filteredCampaigns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-12 text-center text-[10px] font-bold uppercase text-white/35">
                      {isSupabaseConfigured
                        ? "Sin campañas. Crea una con IA o ejecuta la migración promo."
                        : "Configura Supabase para listar campañas."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCampaigns.map((camp) => (
                    <TableRow
                      key={camp.id}
                      className={cn(
                        "group cursor-pointer border-white/5 transition-colors hover:bg-white/[0.02]",
                        selectedCampaign?.id === camp.id && "border-emerald-500/20 bg-emerald-500/5",
                      )}
                      onClick={() => setSelectedCampaign(camp)}
                    >
                      <TableCell className="py-5 pl-8">
                        <div className="flex flex-col">
                          <span className="text-xs font-black uppercase italic tracking-tighter text-white transition-[background-color,border-color,color,opacity,transform] group-hover:emerald-text-glow">
                            {camp.title}
                          </span>
                          <span className="mt-0.5 flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest text-white/30">
                            <Calendar className="h-2 w-2 text-emerald-500" /> CREADO: {formatDate(camp.created_at)}
                          </span>
                          {(camp.channel || camp.country_code) && (
                            <span className="mt-1 text-[8px] text-emerald-500/50">
                              {[camp.channel, camp.country_code !== "ALL" ? camp.country_code : null]
                                .filter(Boolean)
                                .join(" · ")}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge
                            variant="outline"
                            className="w-fit rounded-xl border-emerald-500/20 bg-emerald-500/5 px-3 font-headline text-[9px] font-bold italic tracking-widest text-emerald-400"
                          >
                            {camp.token}
                          </Badge>
                          <span className="text-[8px] font-bold uppercase tracking-widest text-rose-400/60">
                            EXP: {formatDate(camp.expires_at)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-xs font-black text-white">
                          {camp.scan_count} / {camp.max_uses == null ? "∞" : camp.max_uses}
                        </span>
                      </TableCell>
                      <TableCell className="pr-8 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-xl border border-white/5 text-white/20 hover:text-emerald-400 active:scale-90"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCampaign(camp);
                            }}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-xl border border-white/5 text-rose-500/40 hover:text-rose-500 active:scale-90"
                            onClick={(e) => void handleDelete(e, camp)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="glass-panel relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-emerald-500/[0.02]">
            <div className="absolute right-0 top-0 z-10 rounded-bl-xl bg-emerald-500 px-3 py-1 text-[8px] font-black uppercase italic tracking-widest text-black">
              Origen actual
            </div>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest">
                <QrCode className="h-4 w-4 text-emerald-400" /> QR / Magic link
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="relative flex cursor-pointer flex-col items-center justify-center space-y-4 overflow-hidden rounded-[2rem] border border-emerald-500/30 bg-black/80 p-8 group">
                <BrandedQR value={currentUrl || origin || "https://synqai.sports"} size={240} />
                <p className="mt-4 text-center text-[9px] font-black uppercase italic tracking-[0.5em] text-emerald-400">
                  {currentToken ? "SYNC_READY_HD" : "WAITING_FOR_TOKEN"}
                </p>
              </div>

              {currentUrl && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-2xl border-emerald-500/30 font-black uppercase text-[10px] tracking-widest"
                  onClick={copyLink}
                >
                  <Copy className="mr-2 h-4 w-4" /> Copiar URL login
                </Button>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                  <span className="mb-1 block text-[8px] font-black uppercase tracking-widest text-white/30">
                    Caducidad
                  </span>
                  <span className="text-[10px] font-bold uppercase text-emerald-400">
                    {selectedCampaign ? formatDate(selectedCampaign.expires_at) : "—"}
                  </span>
                </div>
                <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                  <span className="mb-1 block text-[8px] font-black uppercase tracking-widest text-white/30">
                    Capacidad
                  </span>
                  <span className="text-[10px] font-bold uppercase text-emerald-400">
                    {selectedCampaign?.max_uses == null ? "∞" : selectedCampaign.max_uses} usos
                  </span>
                </div>
              </div>

              <Button
                onClick={downloadQR}
                className="h-14 w-full rounded-2xl border-none bg-emerald-500 font-black uppercase text-[10px] tracking-[0.2em] text-black shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-[background-color,border-color,color,opacity,transform] hover:scale-[1.02] active:scale-95"
              >
                <Download className="mr-2 h-4 w-4" /> DESCARGAR QR
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent
          side="right"
          className="flex w-full flex-col overflow-hidden border-l border-emerald-500/20 bg-[#04070c]/98 p-0 text-white shadow-[-20px_0_60px_rgba(0,0,0,0.8)] backdrop-blur-3xl sm:max-w-xl"
        >
          <div className="border-b border-white/5 bg-black/40 p-10">
            <SheetHeader className="space-y-4">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 animate-pulse text-emerald-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400">
                  Architect_IA_v3
                </span>
              </div>
              <SheetTitle className="text-left text-4xl font-black uppercase italic leading-none tracking-tighter text-white">
                CONFIG_MAGIC_LINK
              </SheetTitle>
            </SheetHeader>
          </div>

          <div className="custom-scrollbar flex-1 space-y-12 overflow-y-auto p-10">
            <form onSubmit={handleGenerate} className="space-y-8">
              <div className="space-y-3">
                <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-emerald-400/60">
                  Objetivo de captación
                </label>
                <div className="relative">
                  <Target className="absolute left-4 top-5 h-5 w-5 text-emerald-400/30" />
                  <Input
                    value={formData.objective}
                    onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                    placeholder="EJ: CLUBES ÉLITE EN MADRID…"
                    className="h-16 rounded-2xl border-emerald-500/20 bg-white/5 pl-12 text-lg font-bold uppercase focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-emerald-400/60">
                  País / región
                </label>
                <Select
                  value={formData.countryCode}
                  onValueChange={(v) => setFormData({ ...formData, countryCode: v })}
                >
                  <SelectTrigger className="h-14 rounded-2xl border-emerald-500/20 bg-white/5 font-bold uppercase">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-emerald-500/20 bg-[#04070c] text-white">
                    {COUNTRY_OPTIONS.map((c) => (
                      <SelectItem key={c.code} value={c.code} className="text-[10px] font-black uppercase text-white focus:bg-emerald-500 focus:text-black">
                        {c.label} ({c.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-3">
                  <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-emerald-400/60">
                    Plan (B2B club)
                  </label>
                  <Select value={formData.planId} onValueChange={(v) => setFormData({ ...formData, planId: v })}>
                    <SelectTrigger className="h-16 rounded-2xl border-emerald-500/20 bg-white/5 text-xs font-bold uppercase">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-emerald-500/20 bg-[#04070c] text-white">
                      {AVAILABLE_PLANS.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id} className="text-[10px] font-black uppercase text-white focus:bg-emerald-500 focus:text-black">
                          {plan.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-emerald-400/60">
                    Canal
                  </label>
                  <Select
                    value={formData.platform}
                    onValueChange={(v) =>
                      setFormData({ ...formData, platform: v as GenerateCampaignInput["platform"] })
                    }
                  >
                    <SelectTrigger className="h-16 rounded-2xl border-emerald-500/20 bg-white/5 text-xs font-bold uppercase">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-emerald-500/20 bg-[#04070c] text-white">
                      {CHANNEL_OPTIONS.map((ch) => (
                        <SelectItem key={ch.value} value={ch.value} className="text-[10px] font-black uppercase text-white focus:bg-emerald-500 focus:text-black">
                          {ch.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-3">
                  <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-emerald-400/60">
                    Límite de usos (vacío = sin límite)
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-4 top-4 h-4 w-4 text-emerald-400/30" />
                    <Input
                      type="number"
                      min={1}
                      value={formData.maxUses}
                      onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                      placeholder="Vacío = ∞"
                      className="h-12 rounded-2xl border-emerald-500/20 bg-white/5 pl-10 font-bold text-emerald-400"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-emerald-400/60">
                    Periodicidad
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-4 h-4 w-4 text-emerald-400/30" />
                    <Select
                      value={formData.expiryPeriod}
                      onValueChange={(v) => setFormData({ ...formData, expiryPeriod: v })}
                    >
                      <SelectTrigger className="h-12 rounded-2xl border-emerald-500/20 bg-white/5 pl-10 font-bold text-emerald-400">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-emerald-500/20 bg-[#04070c] text-white">
                        <SelectItem value="1_month" className="text-[10px] font-black uppercase text-white focus:bg-emerald-500 focus:text-black">
                          1 MES
                        </SelectItem>
                        <SelectItem value="3_months" className="text-[10px] font-black uppercase text-white focus:bg-emerald-500 focus:text-black">
                          3 MESES
                        </SelectItem>
                        <SelectItem value="6_months" className="text-[10px] font-black uppercase text-white focus:bg-emerald-500 focus:text-black">
                          MEDIO AÑO
                        </SelectItem>
                        <SelectItem value="1_year" className="text-[10px] font-black uppercase text-white focus:bg-emerald-500 focus:text-black">
                          1 AÑO
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="h-20 w-full rounded-2xl border-none bg-emerald-500 text-xs font-black uppercase tracking-[0.4em] text-black transition-[background-color,border-color,color,opacity,transform] hover:scale-[1.01] active:scale-95"
              >
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "GENERAR Y GUARDAR EN BD"}
              </Button>
            </form>

            {result && (
              <div className="animate-in fade-in slide-in-from-bottom-4 relative space-y-6 overflow-hidden rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-8">
                <div className="absolute right-0 top-0 p-4 opacity-10">
                  <Sparkles className="h-20 w-20 text-emerald-400" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400">
                  ASSET_IA_LISTO
                </span>
                <h3 className="text-2xl font-black uppercase italic text-white">{result.campaignTitle}</h3>
                <div className="flex flex-col items-center gap-6 sm:flex-row">
                  <div className="flex-1 rounded-2xl border border-white/10 bg-black/60 p-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Token</p>
                    <p className="font-headline text-3xl font-bold italic tracking-[0.2em] text-emerald-400">
                      {result.suggestedPromoCode}
                    </p>
                  </div>
                  <BrandedQR
                    value={
                      origin
                        ? `${origin}/login?t=${encodeURIComponent(result.suggestedPromoCode)}`
                        : result.suggestedPromoCode
                    }
                    size={140}
                  />
                </div>
                <p className="text-[10px] font-bold uppercase leading-relaxed text-white/40">
                  {isSupabaseConfigured
                    ? "Si falló el guardado en BD, revisa el mensaje de error arriba y vuelve a generar."
                    : "Sin Supabase, copia el token y úsalo manualmente o configura el proyecto."}
                </p>
              </div>
            )}
          </div>

          <SheetFooter className="border-t border-white/5 bg-black/60 p-10">
            <SheetClose asChild>
              <Button
                variant="ghost"
                className="h-16 w-full rounded-2xl border border-white/10 font-black uppercase text-[10px] tracking-widest text-white/40"
              >
                CERRAR
              </Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function PromoMiniStat({ icon: Icon, label, value, trend }: { icon: typeof Layers; label: string; value: string; trend: string }) {
  return (
    <Card className="glass-panel group relative flex items-center gap-5 overflow-hidden rounded-3xl border border-emerald-500/20 bg-black/20 p-5">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
        <Icon className="h-6 w-6 text-emerald-400" />
      </div>
      <div className="relative z-10">
        <p className="text-[9px] font-black uppercase tracking-widest text-white/30">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-black italic tracking-tighter text-white">{value}</p>
          <span className="text-[9px] font-black italic text-emerald-400">{trend}</span>
        </div>
      </div>
    </Card>
  );
}
