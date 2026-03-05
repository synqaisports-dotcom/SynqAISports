"use client";

import { Zap, Plus, Search, Timer, Percent, BarChart3, Megaphone, Share2, MousePointerClick, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function GlobalPromosPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <div className="flex justify-between items-end border-b border-white/5 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="h-5 w-5 text-emerald-400 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-400 tracking-[0.5em] uppercase">Promo_Neural_Generator</span>
          </div>
          <h1 className="text-4xl font-headline font-black text-white uppercase tracking-tighter italic emerald-text-glow">
            CAMPAIGN_COMMAND
          </h1>
        </div>
        <Button className="rounded-none bg-emerald-500 text-black font-black uppercase text-[10px] tracking-widest h-12 px-8 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 transition-all border-none">
          <Plus className="h-4 w-4 mr-2" /> Generar Campaña IA
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <PromoMiniStat icon={Megaphone} label="Alcance Redes" value="48.5k" trend="+12%" />
        <PromoMiniStat icon={MousePointerClick} label="Leads Pizarra" value="1.2k" trend="+24%" />
        <PromoMiniStat icon={TrendingUp} label="Conversión Nodo" value="8.2%" trend="+0.5%" />
        <PromoMiniStat icon={BarChart3} label="ROI Estimado" value="+154%" trend="+15%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="glass-panel lg:col-span-2 overflow-hidden">
          <CardHeader className="bg-black/40 border-b border-white/5 p-6 space-y-4 md:space-y-0 md:flex md:flex-row md:items-center md:justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-emerald-500 opacity-50" />
              <Input 
                placeholder="BUSCAR CAMPAÑA O TOKEN..." 
                className="pl-10 h-12 bg-white/5 border-white/10 rounded-none text-white placeholder:text-white/20 font-bold uppercase text-[10px] tracking-widest focus-visible:ring-emerald-500/50"
              />
            </div>
            <Badge variant="outline" className="rounded-none border-emerald-500/20 text-emerald-400 font-black text-[9px] px-3 py-1 uppercase tracking-widest">
              Campañas Activas: 04
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-white/[0.02]">
                <TableRow className="border-white/5">
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-white/40 h-14 pl-8">Campaña / Hook</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-white/40">Promo_Token</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-white/40 text-center">CTR_Pizarra</TableHead>
                  <TableHead className="text-right font-black text-[10px] uppercase tracking-widest text-white/40 pr-8">Terminal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                 <TableRow className="border-white/5 hover:bg-white/[0.02] transition-colors">
                    <TableCell className="pl-8">
                       <div className="flex flex-col">
                          <span className="font-black text-white text-xs uppercase italic tracking-tighter">REDES_FB_PIZARRA_FREE</span>
                          <span className="text-[8px] text-white/30 font-bold uppercase tracking-widest mt-0.5">Hook: Tactical Board (Ads Mode)</span>
                       </div>
                    </TableCell>
                    <TableCell>
                       <span className="font-headline font-bold text-emerald-400 italic">SOCIAL_FREE_24</span>
                    </TableCell>
                    <TableCell className="text-center">
                       <span className="text-xs font-black text-white">12.4%</span>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                       <Button variant="ghost" size="sm" className="text-emerald-400 hover:bg-emerald-500/5 rounded-none font-black text-[9px] uppercase tracking-widest">Detener</Button>
                    </TableCell>
                 </TableRow>
                 <TableRow className="border-white/5 hover:bg-white/[0.02] transition-colors">
                    <TableCell className="pl-8">
                       <div className="flex flex-col">
                          <span className="font-black text-white text-xs uppercase italic tracking-tighter">VOLUMEN_CORTESÍA_ESPAÑA</span>
                          <span className="text-[8px] text-white/30 font-bold uppercase tracking-widest mt-0.5">Hook: 1€/Niño Demo</span>
                       </div>
                    </TableCell>
                    <TableCell>
                       <span className="font-headline font-bold text-emerald-400 italic">ES_VOL_1EURO</span>
                    </TableCell>
                    <TableCell className="text-center">
                       <span className="text-xs font-black text-white">4.8%</span>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                       <Button variant="ghost" size="sm" className="text-emerald-400 hover:bg-emerald-500/5 rounded-none font-black text-[9px] uppercase tracking-widest">Detener</Button>
                    </TableCell>
                 </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="glass-panel border-emerald-500/20 bg-emerald-500/[0.02]">
           <CardHeader>
              <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                 <Share2 className="h-4 w-4 text-emerald-400" /> Lead Magnet Tracker
              </CardTitle>
           </CardHeader>
           <CardContent className="space-y-6">
              <div className="p-4 bg-black/40 border border-white/5 rounded-2xl">
                 <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Impresiones Publicitarias (Pizarra)</p>
                 <div className="flex items-end justify-between">
                    <p className="text-3xl font-black italic text-white tracking-tighter">142k</p>
                    <span className="text-[9px] text-emerald-400 font-bold uppercase italic">Sincronizado</span>
                 </div>
              </div>
              <div className="p-4 bg-black/40 border border-white/5 rounded-2xl">
                 <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Conversión a Plan Volumen</p>
                 <div className="flex items-end justify-between">
                    <p className="text-3xl font-black italic text-white tracking-tighter">45</p>
                    <span className="text-[9px] text-emerald-400 font-bold uppercase italic">+5 Hoy</span>
                 </div>
              </div>
              <Button className="w-full h-12 bg-emerald-500 text-black font-black uppercase text-[10px] tracking-widest">
                 DESCARGAR REPORTE REDES
              </Button>
           </CardContent>
        </Card>
      </div>
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
