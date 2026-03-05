
"use client";

import { useState } from "react";
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
  MapPin
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

const AVAILABLE_PLANS = [
  { id: "PROMO_LINK", name: "Promo Link (Ads Mode)" },
  { id: "VOLUMEN_CORE", name: "Volumen Core (1€/niño)" },
  { id: "ENTERPRISE_SCALE", name: "Enterprise Scale (0.70€/niño)" },
];

export default function GlobalPromosPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateCampaignOutput | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    objective: "",
    platform: "Facebook" as any,
    planId: "PROMO_LINK"
  });

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.objective) return;
    
    setLoading(true);
    try {
      const data = await generatePromoCampaign(formData);
      setResult(data);
      toast({
        title: "TOKEN_GENERADO",
        description: "Acceso promocional sincronizado y listo para incrustar.",
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
    navigator.clipboard.writeText(text);
    toast({
      description: "URL de acceso copiada al portapapeles.",
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <div className="flex justify-between items-end border-b border-white/5 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <QrCode className="h-5 w-5 text-emerald-400 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-400 tracking-[0.5em] uppercase">Access_Token_Factory</span>
          </div>
          <h1 className="text-4xl font-headline font-black text-white uppercase tracking-tighter italic emerald-text-glow">
            PROMO_COMMAND
          </h1>
        </div>
        <Button 
          onClick={() => setIsSheetOpen(true)}
          className="rounded-none bg-emerald-500 text-black font-black uppercase text-[10px] tracking-widest h-12 px-8 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 transition-all border-none"
        >
          <Plus className="h-4 w-4 mr-2" /> Crear Token IA
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <PromoMiniStat icon={Layers} label="Tokens Activos" value="12" trend="+2" />
        <PromoMiniStat icon={Users} label="Conversiones" value="142" trend="+14%" />
        <PromoMiniStat icon={Globe} label="Regiones" value="05" trend="LatAm/ES" />
        <PromoMiniStat icon={Zap} label="Estado Red" value="Óptima" trend="100%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="glass-panel lg:col-span-2 overflow-hidden">
          <CardHeader className="bg-black/40 border-b border-white/5 p-6 space-y-4 md:space-y-0 md:flex md:flex-row md:items-center md:justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-emerald-400 opacity-50" />
              <Input 
                placeholder="BUSCAR TOKEN O CAMPAÑA..." 
                className="pl-10 h-12 bg-white/5 border-white/10 rounded-none text-white placeholder:text-white/20 font-bold uppercase text-[10px] tracking-widest focus-visible:ring-emerald-500/50"
              />
            </div>
            <Badge variant="outline" className="rounded-none border-emerald-500/20 text-emerald-400 font-black text-[9px] px-3 py-1 uppercase tracking-widest">
              Sincronizado con Nodo Login
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-white/[0.02]">
                <TableRow className="border-white/5">
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-white/40 h-14 pl-8">Campaña / Región</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-white/40">Identificador_Token</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-white/40 text-center">Usos</TableHead>
                  <TableHead className="text-right font-black text-[10px] uppercase tracking-widest text-white/40 pr-8">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                 <TableRow className="border-white/5 hover:bg-white/[0.02] transition-colors">
                    <TableCell className="pl-8">
                       <div className="flex flex-col">
                          <span className="font-black text-white text-xs uppercase italic tracking-tighter">ARG_TOP10_COACHES</span>
                          <span className="text-[8px] text-white/30 font-bold uppercase tracking-widest mt-0.5 flex items-center gap-1">
                             <MapPin className="h-2 w-2" /> Argentina • Plan: Enterprise
                          </span>
                       </div>
                    </TableCell>
                    <TableCell>
                       <span className="font-headline font-bold text-emerald-400 italic">ARG-ELITE-MAGIC</span>
                    </TableCell>
                    <TableCell className="text-center">
                       <span className="text-xs font-black text-white">07 / 10</span>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                       <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-white/20 hover:text-emerald-400" onClick={() => copyToClipboard("https://synqai.sports/login?token=ARG-ELITE-MAGIC")}>
                             <Share2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-rose-400 hover:bg-rose-500/5 rounded-none font-black text-[9px] uppercase tracking-widest">Revocar</Button>
                       </div>
                    </TableCell>
                 </TableRow>
                 <TableRow className="border-white/5 hover:bg-white/[0.02] transition-colors">
                    <TableCell className="pl-8">
                       <div className="flex flex-col">
                          <span className="font-black text-white text-xs uppercase italic tracking-tighter">ES_PIZARRA_ADS_FREE</span>
                          <span className="text-[8px] text-white/30 font-bold uppercase tracking-widest mt-0.5 flex items-center gap-1">
                             <MapPin className="h-2 w-2" /> España • Plan: Promo Link
                          </span>
                       </div>
                    </TableCell>
                    <TableCell>
                       <span className="font-headline font-bold text-emerald-400 italic">ES-BOARD-PROMO</span>
                    </TableCell>
                    <TableCell className="text-center">
                       <span className="text-xs font-black text-white">42 / ∞</span>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                       <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-white/20 hover:text-emerald-400" onClick={() => copyToClipboard("https://synqai.sports/login?token=ES-BOARD-PROMO")}>
                             <Share2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-rose-400 hover:bg-rose-500/5 rounded-none font-black text-[9px] uppercase tracking-widest">Revocar</Button>
                       </div>
                    </TableCell>
                 </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="glass-panel border-emerald-500/20 bg-emerald-500/[0.02]">
           <CardHeader>
              <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                 <QrCode className="h-4 w-4 text-emerald-400" /> Magic Link Builder
              </CardTitle>
           </CardHeader>
           <CardContent className="space-y-6">
              <div className="p-6 bg-black/40 border border-white/5 flex flex-col items-center justify-center space-y-4">
                 <div className="h-32 w-32 bg-white/5 border border-emerald-500/20 flex items-center justify-center p-2">
                    <QrCode className="h-full w-full text-emerald-400/50" />
                 </div>
                 <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em] text-center">Incrustar este QR en creatividades publicitarias</p>
              </div>
              <div className="space-y-2">
                 <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">URL de Acceso Directo</p>
                 <div className="flex gap-2">
                    <Input readOnly value="https://synqai.sports/l/..." className="h-10 bg-white/5 border-white/10 rounded-none text-[10px] font-mono text-emerald-400/60" />
                    <Button size="icon" variant="ghost" className="h-10 w-10 border border-white/10 rounded-none hover:text-emerald-400">
                       <Copy className="h-4 w-4" />
                    </Button>
                 </div>
              </div>
              <Button className="w-full h-12 bg-emerald-500 text-black font-black uppercase text-[10px] tracking-widest">
                 DESCARGAR ASSETS DE CAMPAÑA
              </Button>
           </CardContent>
        </Card>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="bg-[#04070c]/98 backdrop-blur-3xl border-l border-emerald-500/20 text-white w-full sm:max-w-xl shadow-[-20px_0_60px_rgba(0,0,0,0.8)] p-0 overflow-hidden flex flex-col">
          <div className="p-8 border-b border-white/5 bg-black/40">
            <SheetHeader className="space-y-4">
              <div className="flex items-center gap-3">
                <Sparkles className="h-4 w-4 text-emerald-400 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400">Access_Token_Architect_IA</span>
              </div>
              <SheetTitle className="text-3xl font-black italic tracking-tighter text-white uppercase text-left">
                GENERAR TOKEN DE ACCESO
              </SheetTitle>
              <SheetDescription className="text-[10px] uppercase font-bold text-white/30 tracking-widest text-left">
                Configure el nodo de entrada para su campaña de captación regional.
              </SheetDescription>
            </SheetHeader>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-10">
            <form onSubmit={handleGenerate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-emerald-400/60 tracking-widest ml-1">Objetivo_y_Región</label>
                <div className="relative">
                   <Target className="absolute left-3 top-3.5 h-4 w-4 text-emerald-500/30" />
                   <Input 
                    value={formData.objective}
                    onChange={(e) => setFormData({...formData, objective: e.target.value})}
                    placeholder="EJ: ACCESO A 10 ENTRENADORES EN ARGENTINA CON PLAN ÉLITE..." 
                    className="pl-10 h-14 bg-white/5 border-white/10 rounded-none font-bold uppercase focus:border-emerald-500/50 placeholder:text-white/10" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-emerald-400/60 tracking-widest ml-1">Protocolo_Plan_Vinculado</label>
                  <Select 
                    value={formData.planId} 
                    onValueChange={(v) => setFormData({...formData, planId: v})}
                  >
                    <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-none font-bold uppercase tracking-widest">
                      <div className="flex items-center gap-2">
                        <Layers className="h-3 w-3 text-emerald-500/40" />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-[#04070c] border-emerald-500/20 rounded-none">
                      {AVAILABLE_PLANS.map(plan => (
                        <SelectItem key={plan.id} value={plan.id}>{plan.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-emerald-400/60 tracking-widest ml-1">Plataforma_Target</label>
                  <Select 
                    value={formData.platform} 
                    onValueChange={(v) => setFormData({...formData, platform: v})}
                  >
                    <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-none font-bold uppercase tracking-widest">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#04070c] border-emerald-500/20 rounded-none">
                      <SelectItem value="Facebook">FACEBOOK ADS</SelectItem>
                      <SelectItem value="Instagram">INSTAGRAM REELS</SelectItem>
                      <SelectItem value="YouTube">YOUTUBE ADS</SelectItem>
                      <SelectItem value="LinkedIn">LINKEDIN</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-16 bg-emerald-500 text-black font-black uppercase tracking-[0.3em] rounded-none hover:scale-[1.02] transition-all"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "SINTETIZAR TOKEN DE RED IA"}
              </Button>
            </form>

            {result && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">MAGIC_ACCESS_IDENTITIES</span>
                    <Badge className="bg-emerald-500 text-black font-black text-[9px] rounded-none">ACTIVO</Badge>
                  </div>
                  <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">{result.campaignTitle}</h3>
                  
                  <div className="space-y-2 p-4 bg-black/40 border border-white/5">
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Promo_Token_Único</p>
                    <div className="flex items-center justify-between">
                       <p className="text-2xl font-headline font-bold text-emerald-400 italic tracking-widest">{result.suggestedPromoCode}</p>
                       <Button variant="ghost" size="icon" className="h-8 w-8 text-white/20 hover:text-emerald-400" onClick={() => copyToClipboard(result.suggestedPromoCode)}>
                          <Copy className="h-4 w-4" />
                       </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Estrategia_IA_de_Captación</p>
                    <p className="text-[11px] text-white/60 leading-relaxed font-bold italic">{result.mainHook}</p>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Copy_Publicitario_Sugerido</p>
                    </div>
                    <div className="text-[10px] text-white/40 leading-tight uppercase font-bold bg-black/20 p-4 border border-white/5 whitespace-pre-wrap">
                      {result.socialMediaCopy}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-8 bg-black/40 border-t border-white/5">
            <SheetClose asChild>
              <Button variant="ghost" className="w-full h-14 border border-white/10 text-white/40 font-black uppercase text-[10px] tracking-widest hover:bg-white/5">
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
    <Card className="glass-panel p-4 flex items-center gap-4 relative overflow-hidden group">
       <div className="h-10 w-10 bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-all">
          <Icon className="h-5 w-5 text-emerald-500" />
       </div>
       <div>
          <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">{label}</p>
          <div className="flex items-baseline gap-2">
             <p className="text-xl font-black text-white italic">{value}</p>
             <span className="text-[8px] font-black text-emerald-400">{trend}</span>
          </div>
       </div>
       <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 scan-line" />
    </Card>
  );
}
