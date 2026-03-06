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

// Componente de QR Profesional con Branding Central Reforzado
const BrandedQR = ({ value, size = 200 }: { value: string; size?: number }) => (
  <div className="relative flex items-center justify-center p-3 bg-black rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(16,185,129,0.25)] border border-emerald-500/10">
    <QRCodeCanvas
      value={value}
      size={size}
      level="H"
      fgColor="#10b981"
      bgColor="#000000"
      includeMargin={false}
    />
    {/* Overlay de Marca Central - Aumentado */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black px-4 py-2 border border-emerald-500/50 rounded-md shadow-[0_0_15px_rgba(16,185,129,0.4)]">
      <span className="text-[14px] font-black text-emerald-400 uppercase tracking-tight italic">SynQAI</span>
    </div>
    <div className="absolute inset-0 scan-line opacity-20 pointer-events-none" />
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
        description: "Debe definir un objetivo y una región (ej. 10 primeros de Argentina).",
      });
      return;
    }
    
    setLoading(true);
    try {
      const data = await generatePromoCampaign(formData);
      setResult(data);
      // Al generar uno nuevo, lo ponemos como seleccionado para previsualizarlo
      setSelectedCampaign({
        title: data.campaignTitle,
        region: formData.objective,
        planId: data.suggestedPlanId,
        token: data.suggestedPromoCode,
        hook: data.mainHook,
        copy: data.socialMediaCopy
      });
      toast({
        title: "MAGIC_LINK_GENERADO",
        description: "Token de red y QR configurados con éxito.",
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
      description: "Copiado al portapapeles.",
    });
  };

  const currentToken = selectedCampaign?.token || result?.suggestedPromoCode;
  const currentHook = selectedCampaign?.hook || result?.mainHook;
  const currentUrl = currentToken ? `https://synqai.sports/login?token=${currentToken}` : "";

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      {/* HEADER TÁCTICO */}
      <div className="flex justify-between items-end border-b border-white/5 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <QrCode className="h-5 w-5 text-emerald-400 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-400 tracking-[0.5em] uppercase">Magic_Link_Factory</span>
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

      {/* MÉTRICAS DE RED */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <PromoMiniStat icon={Layers} label="Tokens de Red" value={MOCK_CAMPAIGNS.length.toString()} trend="+2" />
        <PromoMiniStat icon={Users} label="Altas por QR" value="142" trend="+14%" />
        <PromoMiniStat icon={Globe} label="Regiones Activas" value="03" trend="LatAm / ES" />
        <PromoMiniStat icon={Zap} label="ROI_Captación" value="24%" trend="UP_LINK" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LISTADO DE MAGIC LINKS */}
        <Card className="glass-panel lg:col-span-2 overflow-hidden bg-black/40 border-none">
          <CardHeader className="border-b border-white/5 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-emerald-400 opacity-50" />
              <Input 
                placeholder="BUSCAR CAMPAÑA O TOKEN..." 
                className="pl-10 h-12 bg-white/5 border-white/10 rounded-none text-white placeholder:text-white/20 font-bold uppercase text-[10px] tracking-widest focus-visible:ring-emerald-500/50"
              />
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-white/20 hover:text-emerald-400 cursor-pointer transition-colors" />
              <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Estado Red: Sincronizada</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-white/[0.02]">
                <TableRow className="border-white/5">
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-white/40 h-14 pl-8">Campaña / Región</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-white/40">Identificador_Token</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-white/40 text-center">Protocolo_Uso</TableHead>
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
                             <MapPin className="h-2 w-2 text-emerald-500" /> {camp.region} • Plan: {camp.plan}
                          </span>
                       </div>
                    </TableCell>
                    <TableCell>
                       <Badge variant="outline" className="rounded-none border-emerald-500/20 text-emerald-400 font-headline font-bold text-[10px] italic tracking-widest bg-emerald-500/5 px-3">
                        {camp.token}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                       <div className="flex flex-col items-center">
                          <span className="text-xs font-black text-white">{camp.used} / {camp.total === 0 ? '∞' : camp.total}</span>
                          <div className="w-16 h-1 bg-white/5 mt-1 overflow-hidden">
                             <div 
                               className="h-full bg-emerald-500 transition-all duration-1000" 
                               style={{ width: camp.total === 0 ? '40%' : `${(camp.used / camp.total) * 100}%` }} 
                             />
                          </div>
                       </div>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                       <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 text-white/20 hover:text-emerald-400 border border-white/5" 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCampaign(camp);
                            }}
                            title="Previsualizar QR"
                          >
                             <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 text-white/20 hover:text-emerald-400 border border-white/5" 
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(`https://synqai.sports/login?token=${camp.token}`);
                            }}
                            title="Copiar Magic Link"
                          >
                             <Share2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 text-white/20 hover:text-rose-400 border border-white/5"
                            title="Revocar Token"
                            onClick={(e) => e.stopPropagation()}
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
        </Card>

        {/* PREVIEW DE MAGIC LINK Y QR */}
        <div className="space-y-6">
          <Card className="glass-panel border-emerald-500/20 bg-emerald-500/[0.02] overflow-hidden relative">
            <div className="absolute top-0 right-0 bg-emerald-500 text-black text-[8px] font-black px-3 py-1 uppercase tracking-widest z-10">Live_QR_Builder</div>
            <CardHeader className="pb-4">
                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                  <QrCode className="h-4 w-4 text-emerald-400" /> Magic Link Architect
                </CardTitle>
                <CardDescription className="text-[9px] font-black uppercase tracking-widest text-white/30">
                  {selectedCampaign?.title || 'Sincronizando Nodo...'}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="p-10 bg-black/60 border border-emerald-500/20 flex flex-col items-center justify-center space-y-4 rounded-3xl group cursor-pointer relative overflow-hidden">
                  <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {/* QR INTEGRADO CON LIBRERÍA - Aumentado un poco en el preview */}
                  <div className="group-hover:scale-[1.05] transition-all duration-500">
                    <BrandedQR value={currentUrl || "https://synqai.sports"} size={220} />
                  </div>

                  <p className="text-[9px] font-black text-emerald-400/40 uppercase tracking-[0.4em] text-center relative z-10 group-hover:text-emerald-400 transition-colors">
                    {currentToken ? 'QR_ENCRYPT_SYNC' : 'ESPERANDO_NODO'}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-end px-1">
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">URL de Acceso Directo</p>
                    <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest italic">{currentToken ? 'Sincronizada' : 'Pendiente'}</span>
                  </div>
                  <div className="flex gap-2">
                      <Input 
                        readOnly 
                        value={currentUrl || "Sincronizando URL..."} 
                        className="h-12 bg-white/5 border-white/10 rounded-none text-[10px] font-mono text-emerald-400/60 focus:ring-0" 
                      />
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-12 w-12 border border-white/10 rounded-none hover:text-emerald-400 bg-white/5" 
                        onClick={() => copyToClipboard(currentUrl)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <div className="p-5 bg-black/40 border border-white/5 space-y-3 rounded-2xl">
                     <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Hook Táctico Vincuado</p>
                     <p className="text-[10px] text-white/60 leading-relaxed font-bold italic uppercase">
                       {currentHook || 'Defina un objetivo regional para generar el gancho de escasez.'}
                     </p>
                  </div>
                  <Button className="w-full h-14 bg-emerald-500 text-black font-black uppercase text-[10px] tracking-widest rounded-none shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:scale-[1.02] transition-all border-none">
                    DESCARGAR PACK DE CAMPAÑA (QR + LINK)
                  </Button>
                </div>
            </CardContent>
          </Card>

          <div className="p-8 rounded-3xl border border-white/5 bg-black/40 space-y-4">
             <div className="flex items-center gap-3">
                <Target className="h-4 w-4 text-emerald-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60">Estrategia_Escasez_Regional</span>
             </div>
             <p className="text-[10px] text-white/40 leading-relaxed font-bold uppercase italic tracking-wider">
               Al seleccionar una campaña de la lista, el sistema carga el token regional. El QR es inmutable y siempre llevará al usuario a la configuración de plan seleccionada.
             </p>
          </div>
        </div>
      </div>

      {/* TERMINAL DE GENERACIÓN IA Y CONFIGURACIÓN QR */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="bg-[#04070c]/98 backdrop-blur-3xl border-l border-emerald-500/20 text-white w-full sm:max-w-xl shadow-[-20px_0_60px_rgba(0,0,0,0.8)] p-0 overflow-hidden flex flex-col">
          <div className="p-10 border-b border-white/5 bg-black/40">
            <SheetHeader className="space-y-4">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-emerald-400 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400">Magic_Token_Architect_IA</span>
              </div>
              <SheetTitle className="text-4xl font-black italic tracking-tighter text-white uppercase text-left leading-none">
                CONFIGURAR MAGIC LINK & QR
              </SheetTitle>
              <SheetDescription className="text-[10px] uppercase font-bold text-white/30 tracking-widest text-left">
                Vincule un país, un plan de volumen y un límite de captación para generar el acceso regional.
              </SheetDescription>
            </SheetHeader>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-12">
            <form onSubmit={handleGenerate} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-emerald-400/60 tracking-widest ml-1">Región y Objetivo de Captación</label>
                <div className="relative">
                   <Target className="absolute left-4 top-4.5 h-5 w-5 text-emerald-500/30" />
                   <Input 
                    value={formData.objective}
                    onChange={(e) => setFormData({...formData, objective: e.target.value})}
                    placeholder="EJ: PRIMEROS 10 ENTRENADORES EN ARGENTINA..." 
                    className="pl-12 h-16 bg-white/5 border-white/10 rounded-none font-bold uppercase focus:border-emerald-500/50 placeholder:text-white/10 text-lg" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-emerald-400/60 tracking-widest ml-1">Protocolo_Plan (Escalado)</label>
                  <Select 
                    value={formData.planId} 
                    onValueChange={(v) => setFormData({...formData, planId: v})}
                  >
                    <SelectTrigger className="h-16 bg-white/5 border-white/10 rounded-none font-bold uppercase tracking-widest text-xs">
                      <div className="flex items-center gap-3">
                        <Layers className="h-4 w-4 text-emerald-500/40" />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-[#04070c] border-emerald-500/20 rounded-none">
                      {AVAILABLE_PLANS.map(plan => (
                        <SelectItem key={plan.id} value={plan.id} className="text-[10px] font-black uppercase tracking-widest focus:bg-emerald-500">
                          {plan.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-emerald-400/60 tracking-widest ml-1">Canal de Difusión (Plataforma)</label>
                  <Select 
                    value={formData.platform} 
                    onValueChange={(v) => setFormData({...formData, platform: v})}
                  >
                    <SelectTrigger className="h-16 bg-white/5 border-white/10 rounded-none font-bold uppercase tracking-widest text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#04070c] border-emerald-500/20 rounded-none">
                      <SelectItem value="Facebook" className="text-[10px] font-black uppercase">FACEBOOK / INSTAGRAM ADS</SelectItem>
                      <SelectItem value="YouTube" className="text-[10px] font-black uppercase">YOUTUBE VIDEO ADS</SelectItem>
                      <SelectItem value="LinkedIn" className="text-[10px] font-black uppercase">LINKEDIN PROFESSIONAL</SelectItem>
                      <SelectItem value="Google Ads" className="text-[10px] font-black uppercase">GOOGLE SEARCH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-20 bg-emerald-500 text-black font-black uppercase tracking-[0.4em] rounded-none hover:scale-[1.01] transition-all text-xs shadow-[0_0_30px_rgba(16,185,129,0.3)] border-none"
              >
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "GENERAR MAGIC LINK & ESTRATEGIA IA"}
              </Button>
            </form>

            {result && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
                <div className="p-8 bg-emerald-500/5 border border-emerald-500/30 space-y-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all">
                    <Sparkles className="h-24 w-24 text-emerald-400" />
                  </div>
                  
                  <div className="flex items-center justify-between relative z-10">
                    <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">MAGIC_TOKEN_CONFIG_READY</span>
                    <Badge className="bg-emerald-500 text-black font-black text-[9px] rounded-none px-3">PROTOCOLO: {formData.planId}</Badge>
                  </div>

                  <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white relative z-10">{result.campaignTitle}</h3>
                  
                  <div className="grid grid-cols-[1fr_200px] gap-6 items-center relative z-10">
                    <div className="space-y-3 p-6 bg-black/60 border border-white/10 rounded-2xl">
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Token_Único_Generado</p>
                      <div className="flex items-center justify-between">
                         <p className="text-3xl font-headline font-bold text-emerald-400 italic tracking-[0.2em]">{result.suggestedPromoCode}</p>
                         <Button variant="ghost" size="icon" className="h-10 w-10 text-white/20 hover:text-emerald-400 border border-white/5" onClick={() => copyToClipboard(result.suggestedPromoCode)}>
                            <Copy className="h-4 w-4" />
                         </Button>
                      </div>
                    </div>
                    {/* QR PRO EN LA TERMINAL */}
                    <BrandedQR value={currentUrl} size={180} />
                  </div>

                  <div className="space-y-3 relative z-10">
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Gancho de Captación (Estrategia IA)</p>
                    <p className="text-sm text-white/80 leading-relaxed font-bold italic border-l-2 border-emerald-500/40 pl-4 bg-white/5 p-4">
                      {result.mainHook}
                    </p>
                  </div>

                  <div className="space-y-3 pt-4 relative z-10">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Copy_Anuncio_Personalizado</p>
                      <Button variant="link" className="h-auto p-0 text-[9px] font-black text-emerald-400/60 uppercase" onClick={() => copyToClipboard(result.socialMediaCopy)}>Copiar Texto</Button>
                    </div>
                    <div className="text-[11px] text-white/50 leading-relaxed uppercase font-bold bg-black/40 p-6 border border-white/5 whitespace-pre-wrap rounded-2xl">
                      {result.socialMediaCopy}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-10 bg-black/60 border-t border-white/5">
            <SheetClose asChild>
              <Button variant="ghost" className="w-full h-16 border border-white/10 text-white/40 font-black uppercase text-[10px] tracking-widest hover:bg-white/5">
                CERRAR_TERMINAL_CONFIG
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
       <div className="h-12 w-12 bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-all rotate-3 group-hover:rotate-0 duration-500">
          <Icon className="h-6 w-6 text-emerald-400" />
       </div>
       <div className="relative z-10">
          <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">{label}</p>
          <div className="flex items-baseline gap-2">
             <p className="text-2xl font-black text-white italic tracking-tighter">{value}</p>
             <span className="text-[9px] font-black text-emerald-400 italic">{trend}</span>
          </div>
       </div>
       <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 scan-line" />
    </Card>
  );
}
