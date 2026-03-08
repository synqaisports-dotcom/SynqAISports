
"use client";

import { useState, useEffect } from "react";
import { 
  Zap, 
  Plus, 
  Search, 
  Timer, 
  Percent, 
  BarChart3, 
  Megaphone, 
  Share2, 
  MousePointerClick, 
  TrendingUp,
  Loader2,
  Sparkles,
  ArrowRight,
  Copy,
  Target,
  Layers,
  QrCode,
  Globe,
  Users,
  MapPin,
  ExternalLink,
  Trash2,
  RefreshCw,
  Download,
  Eye
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generatePromoCampaign, GenerateCampaignOutput } from "@/ai/flows/generate-promo-campaign";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { QRCodeCanvas } from "qrcode.react";

const AVAILABLE_PLANS = [
  { id: "PROMO_LINK", name: "Promo Link (Pizarra + Ads)" },
  { id: "VOLUMEN_CORE", name: "Volumen Core (1€/niño)" },
  { id: "ENTERPRISE_SCALE", name: "Enterprise Scale (0.70€/niño)" },
];

const MOCK_CAMPAIGNS = [
  { 
    id: "c1", 
    title: "ARG_TOP10_COACHES", 
    region: "Argentina", 
    plan: "Enterprise Scale", 
    planId: "ENTERPRISE_SCALE",
    token: "ARG-ELITE-MAGIC", 
    used: 7, 
    total: 10,
    hook: "Acceso exclusivo para los 10 primeros entrenadores de Argentina con un coste reducido de 0.70€ por niño."
  },
  { 
    id: "c2", 
    title: "ES_PIZARRA_FREE_ADS", 
    region: "España", 
    plan: "Promo Link", 
    planId: "PROMO_LINK",
    token: "ES-BOARD-PROMO", 
    used: 42, 
    total: 0,
    hook: "Consigue la pizarra táctica profesional gratis. Incluye anuncios integrados en el modo promo."
  },
  { 
    id: "c3", 
    title: "MEX_ACADEMY_VOL", 
    region: "México", 
    plan: "Volumen Core", 
    planId: "VOLUMEN_CORE",
    token: "MEX-CORE-800", 
    used: 12, 
    total: 50,
    hook: "Plan de volumen para academias en México. Sincroniza hasta 800 niños a 1€/mes."
  },
];

/**
 * Componente de QR de Alta Definición con Sello SynQAI Reforzado.
 * Optimizado para lectura en móviles y calidad de impresión.
 */
const BrandedQR = ({ value, size = 280 }: { value: string; size?: number }) => (
  <div className="relative flex items-center justify-center p-4 bg-black rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.3)] border border-emerald-500/20 group">
    <QRCodeCanvas
      value={value}
      size={size}
      level="H" // Máxima corrección de errores para permitir logo central grande
      fgColor="#10b981" // Verde Eléctrico SynQAI
      bgColor="#000000"
      includeMargin={false}
    />
    
    {/* Sello de Marca Central Reforzado - Tamaño aumentado */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 px-5 py-2.5 rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.8)] border-2 border-black group-hover:scale-110 transition-transform duration-500 z-10">
      <span className="text-[16px] font-black text-black uppercase tracking-tighter italic">SynQAI</span>
    </div>
    
    {/* Efecto de Escaneo Técnico */}
    <div className="absolute inset-0 bg-emerald-500/5 scan-line opacity-30 pointer-events-none" />
    <div className="absolute inset-0 border border-emerald-500/10 rounded-3xl pointer-events-none" />
  </div>
);

export default function GlobalPromosPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateCampaignOutput | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(MOCK_CAMPAIGNS[0]);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    objective: "",
    platform: "Facebook" as any,
    planId: "PROMO_LINK"
  });

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.objective) {
      toast({
        variant: "destructive",
        title: "ERROR_PARAMETROS",
        description: "Debe definir un objetivo y una región.",
      });
      return;
    }
    
    setLoading(true);
    try {
      const data = await generatePromoCampaign(formData);
      setResult(data);
      setSelectedCampaign({
        title: data.campaignTitle,
        region: formData.objective,
        planId: data.suggestedPlanId,
        token: data.suggestedPromoCode,
        hook: data.mainHook,
        copy: data.socialMediaCopy
      });
      toast({
        title: "NODO_IA_SINCRO",
        description: "Protocolo de Magic Link y QR generado en alta resolución.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "FALLO_MOTOR_IA",
        description: "No se pudo sincronizar con el generador de tokens.",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast({
      description: "URL de red copiada al portapapeles.",
    });
  };

  const downloadQR = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.download = `SynQAI_QR_${selectedCampaign?.token || 'PROMO'}.png`;
      link.href = url;
      link.click();
      toast({
        title: "EXPORTACIÓN_EXITOSA",
        description: "QR de alta definición listo para cartelería y anuncios.",
      });
    }
  };

  const currentToken = selectedCampaign?.token || result?.suggestedPromoCode;
  const currentHook = selectedCampaign?.hook || result?.mainHook;
  const currentUrl = currentToken ? `https://synqai.sports/login?token=${currentToken}` : "";

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <div className="flex justify-between items-end border-b border-white/5 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <QrCode className="h-5 w-5 text-emerald-400 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-400 tracking-[0.5em] uppercase">Magic_Link_Factory_v2.0</span>
          </div>
          <h1 className="text-4xl font-headline font-black text-white uppercase tracking-tighter italic emerald-text-glow">
            PROMO_COMMAND
          </h1>
        </div>
        <Button 
          onClick={() => {
            setResult(null);
            setIsSheetOpen(true);
          }}
          className="rounded-none bg-emerald-500 text-black font-black uppercase text-[10px] tracking-widest h-12 px-8 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 transition-all border-none"
        >
          <Plus className="h-4 w-4 mr-2" /> Crear Magic Link / QR
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <PromoMiniStat icon={Layers} label="Tokens Activos" value={MOCK_CAMPAIGNS.length.toString()} trend="+2" />
        <PromoMiniStat icon={Users} label="Sincronizaciones" value="142" trend="+14%" />
        <PromoMiniStat icon={Globe} label="Sectores" value="03" trend="LatAm / ES" />
        <PromoMiniStat icon={Zap} label="Conversión" value="24%" trend="UP_LINK" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="glass-panel lg:col-span-2 overflow-hidden bg-black/40 border-none">
          <CardHeader className="border-b border-white/5 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-emerald-400 opacity-50" />
              <Input 
                placeholder="BUSCAR CAMPAÑA O TOKEN..." 
                className="pl-10 h-12 bg-white/5 border-emerald-500/20 rounded-none text-white placeholder:text-white/20 font-bold uppercase text-[10px] tracking-widest focus-visible:ring-emerald-500/50"
              />
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-white/20 hover:text-emerald-400 cursor-pointer transition-colors" />
              <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Sincronización: Activa</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-white/[0.02]">
                <TableRow className="border-white/5">
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-white/40 h-14 pl-8">Campaña / Región</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-white/40">Token</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-white/40 text-center">Uso</TableHead>
                  <TableHead className="text-right font-black text-[10px] uppercase tracking-widest text-white/40 pr-8">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                 {MOCK_CAMPAIGNS.map((camp) => (
                   <TableRow 
                    key={camp.id} 
                    className={cn(
                      "border-white/5 hover:bg-white/[0.02] transition-colors group cursor-pointer",
                      selectedCampaign?.id === camp.id && "bg-emerald-500/5 border-emerald-500/20"
                    )}
                    onClick={() => setSelectedCampaign(camp)}
                   >
                    <TableCell className="pl-8 py-5">
                       <div className="flex flex-col">
                          <span className="font-black text-white text-xs uppercase italic tracking-tighter group-hover:emerald-text-glow transition-all">{camp.title}</span>
                          <span className="text-[8px] text-white/30 font-bold uppercase tracking-widest mt-0.5 flex items-center gap-1">
                             <MapPin className="h-2 w-2 text-emerald-500" /> {camp.region}
                          </span>
                       </div>
                    </TableCell>
                    <TableCell>
                       <Badge variant="outline" className="rounded-none border-emerald-500/20 text-emerald-400 font-headline font-bold text-[10px] italic tracking-widest bg-emerald-500/5 px-3">
                        {camp.token}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                       <span className="text-xs font-black text-white">{camp.used} / {camp.total === 0 ? '∞' : camp.total}</span>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                       <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-white/20 hover:text-emerald-400 border border-white/5" onClick={(e) => { e.stopPropagation(); setSelectedCampaign(camp); }}>
                             <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-white/20 hover:text-emerald-400 border border-white/5" onClick={(e) => { e.stopPropagation(); downloadQR(); }}>
                             <Download className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-white/20 hover:text-rose-400 border border-white/5">
                             <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                       </div>
                    </TableCell>
                   </TableRow>
                 ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="glass-panel border-emerald-500/20 bg-emerald-500/[0.02] overflow-hidden relative">
            <div className="absolute top-0 right-0 bg-emerald-500 text-black text-[8px] font-black px-3 py-1 uppercase tracking-widest z-10 italic">High_Res_Node</div>
            <CardHeader className="pb-4">
                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                  <QrCode className="h-4 w-4 text-emerald-400" /> Digital Asset Preview
                </CardTitle>
                <CardDescription className="text-[9px] font-black uppercase tracking-widest text-white/30 italic">
                  Optimizado para impresión y medios digitales
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="p-8 bg-black/80 border border-emerald-500/30 flex flex-col items-center justify-center space-y-4 rounded-3xl group cursor-pointer relative overflow-hidden">
                  <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <BrandedQR value={currentUrl || "https://synqai.sports"} size={260} />

                  <p className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.5em] text-center relative z-10 mt-4 italic">
                    {currentToken ? 'SYNC_READY_HD' : 'WAITING_FOR_TOKEN'}
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-[9px] font-black text-white/40 uppercase tracking-widest px-1">Magic Link de Red</p>
                  <div className="flex gap-2">
                      <Input 
                        readOnly 
                        value={currentUrl || "Sincronizando..."} 
                        className="h-12 bg-white/5 border-emerald-500/20 rounded-none text-[10px] font-mono text-emerald-400/80" 
                      />
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-12 w-12 border border-emerald-500/20 rounded-none hover:text-emerald-400 bg-white/5" 
                        onClick={() => copyToClipboard(currentUrl)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                  </div>
                </div>

                <div className="pt-2 space-y-4">
                  <Button 
                    onClick={downloadQR}
                    className="w-full h-16 bg-emerald-500 text-black font-black uppercase text-[10px] tracking-[0.2em] rounded-none shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-[1.02] transition-all border-none"
                  >
                    <Download className="h-4 w-4 mr-2" /> DESCARGAR PACK DE IMPRESIÓN (HD)
                  </Button>
                  <p className="text-[8px] text-white/30 text-center uppercase font-bold tracking-widest">Formatos: PNG HD (Canvas Render)</p>
                </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="bg-[#04070c]/98 backdrop-blur-3xl border-l border-emerald-500/20 text-white w-full sm:max-w-xl shadow-[-20px_0_60px_rgba(0,0,0,0.8)] p-0 overflow-hidden flex flex-col">
          <div className="p-10 border-b border-white/5 bg-black/40">
            <SheetHeader className="space-y-4">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-emerald-400 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400">Architect_IA_v2.0</span>
              </div>
              <SheetTitle className="text-4xl font-black italic tracking-tighter text-white uppercase text-left leading-none">
                CONFIG_MAGIC_LINK
              </SheetTitle>
              <SheetDescription className="text-[10px] uppercase font-bold text-white/30 tracking-widest text-left">
                Genere activos de marketing regional con sello de marca SynQAI.
              </SheetDescription>
            </SheetHeader>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-12">
            <form onSubmit={handleGenerate} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-emerald-400/60 tracking-widest ml-1">Objetivo de Captación</label>
                <div className="relative">
                   <Target className="absolute left-4 top-5 h-5 w-5 text-emerald-500/30" />
                   <Input 
                    value={formData.objective}
                    onChange={(e) => setFormData({...formData, objective: e.target.value})}
                    placeholder="EJ: TOP 10 CLUBES EN BUENOS AIRES..." 
                    className="pl-12 h-16 bg-white/5 border-emerald-500/20 rounded-none font-bold uppercase focus:border-emerald-500/50 text-lg" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-emerald-400/60 tracking-widest ml-1">Protocolo_Plan</label>
                  <Select 
                    value={formData.planId} 
                    onValueChange={(v) => setFormData({...formData, planId: v})}
                  >
                    <SelectTrigger className="h-16 bg-white/5 border-emerald-500/20 rounded-none font-bold uppercase tracking-widest text-xs focus:border-emerald-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#04070c] border-emerald-500/20 rounded-none">
                      {AVAILABLE_PLANS.map(plan => (
                        <SelectItem key={plan.id} value={plan.id} className="text-[10px] font-black uppercase tracking-widest">
                          {plan.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-emerald-400/60 tracking-widest ml-1">Canal de Difusión</label>
                  <Select 
                    value={formData.platform} 
                    onValueChange={(v) => setFormData({...formData, platform: v})}
                  >
                    <SelectTrigger className="h-16 bg-white/5 border-emerald-500/20 rounded-none font-bold uppercase tracking-widest text-xs focus:border-emerald-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#04070c] border-emerald-500/20 rounded-none">
                      <SelectItem value="Facebook" className="text-[10px] font-black uppercase">SOCIAL ADS</SelectItem>
                      <SelectItem value="YouTube" className="text-[10px] font-black uppercase">VIDEO ADS</SelectItem>
                      <SelectItem value="LinkedIn" className="text-[10px] font-black uppercase">PROFESSIONAL</SelectItem>
                      <SelectItem value="Google Ads" className="text-[10px] font-black uppercase">SEARCH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-20 bg-emerald-500 text-black font-black uppercase tracking-[0.4em] rounded-none hover:scale-[1.01] transition-all text-xs border-none"
              >
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "GENERAR ASSETS DE CAMPAÑA IA"}
              </Button>
            </form>

            {result && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
                <div className="p-8 bg-emerald-500/5 border border-emerald-500/30 space-y-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Sparkles className="h-24 w-24 text-emerald-400" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">ASSET_SYNC_COMPLETE</span>
                  </div>

                  <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">{result.campaignTitle}</h3>
                  
                  <div className="grid grid-cols-[1fr_auto] gap-8 items-center">
                    <div className="space-y-4 p-6 bg-black/60 border border-white/10 rounded-2xl">
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Token Generado</p>
                      <p className="text-4xl font-headline font-bold text-emerald-400 italic tracking-[0.2em]">{result.suggestedPromoCode}</p>
                    </div>
                    <BrandedQR value={currentUrl} size={180} />
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Estrategia de Captación</p>
                    <p className="text-sm text-white/80 leading-relaxed font-bold italic border-l-2 border-emerald-500/40 pl-4 bg-white/5 p-4">
                      {result.mainHook}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-10 bg-black/60 border-t border-white/5">
            <SheetClose asChild>
              <Button variant="ghost" className="w-full h-16 border border-white/10 text-white/40 font-black uppercase text-[10px] tracking-widest">
                CERRAR_TERMINAL
              </Button>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function PromoMiniStat({ icon: Icon, label, value, trend }: any) {
  return (
    <Card className="glass-panel p-5 flex items-center gap-5 relative overflow-hidden group border-none bg-black/20">
       <div className="h-12 w-12 bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-all rotate-3 group-hover:rotate-0 duration-500 rounded-2xl">
          <Icon className="h-6 w-6 text-emerald-400" />
       </div>
       <div className="relative z-10">
          <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">{label}</p>
          <div className="flex items-baseline gap-2">
             <p className="text-2xl font-black text-white italic tracking-tighter">{value}</p>
             <span className="text-[9px] font-black text-emerald-400 italic">{trend}</span>
          </div>
       </div>
       <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-10 scan-line" />
    </Card>
  );
}
