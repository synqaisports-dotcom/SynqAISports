
"use client";

import { Zap, Plus, Search, Timer, Percent, BarChart3 } from "lucide-react";
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
          <Plus className="h-4 w-4 mr-2" /> Generar Código IA
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PromoMiniStat icon={Percent} label="Descuento Promedio" value="15%" />
        <PromoMiniStat icon={Timer} label="Vencimiento Próximo" value="3 Días" />
        <PromoMiniStat icon={BarChart3} label="ROI Campaña" value="+24%" />
      </div>

      <Card className="glass-panel overflow-hidden">
        <CardHeader className="bg-black/40 border-b border-white/5 p-6 space-y-4 md:space-y-0 md:flex md:flex-row md:items-center md:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-emerald-500 opacity-50" />
            <Input 
              placeholder="BUSCAR CÓDIGO_TOKEN..." 
              className="pl-10 h-12 bg-white/5 border-white/10 rounded-none text-white placeholder:text-white/20 font-bold uppercase text-[10px] tracking-widest focus-visible:ring-emerald-500/50"
            />
          </div>
          <Badge variant="outline" className="rounded-none border-emerald-500/20 text-emerald-400 font-black text-[9px] px-3 py-1 uppercase tracking-widest">
            Tokens Activos: 12
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white/[0.02]">
              <TableRow className="border-white/5">
                <TableHead className="font-black text-[10px] uppercase tracking-widest text-white/40 h-14 pl-8">Token_Promo</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest text-white/40">Descuento</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest text-white/40">Expiración</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest text-white/40">Usos</TableHead>
                <TableHead className="text-right font-black text-[10px] uppercase tracking-widest text-white/40 pr-8">Terminal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
               <TableRow className="border-white/5">
                  <TableCell className="pl-8">
                     <span className="font-headline font-bold text-emerald-400 italic">LAUNCH_2024</span>
                  </TableCell>
                  <TableCell>
                     <span className="text-xs font-black text-white">20%</span>
                  </TableCell>
                  <TableCell>
                     <span className="text-[10px] font-bold text-white/50 uppercase">31 DIC 2024</span>
                  </TableCell>
                  <TableCell>
                     <span className="text-xs font-black text-white">45/100</span>
                  </TableCell>
                  <TableCell className="text-right pr-8">
                     <Button variant="ghost" size="sm" className="text-emerald-400 hover:bg-emerald-500/5 rounded-none font-black text-[9px] uppercase tracking-widest">Desactivar</Button>
                  </TableCell>
               </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function PromoMiniStat({ icon: Icon, label, value }: any) {
  return (
    <Card className="glass-panel p-4 flex items-center gap-4">
       <div className="h-10 w-10 bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
          <Icon className="h-5 w-5 text-emerald-500" />
       </div>
       <div>
          <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">{label}</p>
          <p className="text-xl font-black text-white italic">{value}</p>
       </div>
    </Card>
  );
}
