
"use client";

import { useState } from "react";
import { 
  Sprout, 
  Plus, 
  Search, 
  Trophy, 
  Users, 
  LayoutGrid, 
  ChevronRight, 
  Settings2, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  ShieldCheck, 
  Activity, 
  Target,
  ArrowUpRight,
  Loader2,
  FolderPlus,
  Layers,
  Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription, 
  SheetFooter, 
  SheetClose,
  SheetTrigger
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const STAGES = [
  { id: "s1", name: "Iniciación", description: "Descubrimiento y psicomotricidad básica.", color: "text-blue-400" },
  { id: "s2", name: "Formación", description: "Desarrollo de fundamentos técnicos y tácticos.", color: "text-emerald-400" },
  { id: "s3", name: "Competición", description: "Alto rendimiento y especialización.", color: "text-primary" },
  { id: "s4", name: "Rendimiento", description: "Máxima exigencia y resultados de red.", color: "text-rose-400" },
];

const INITIAL_CATEGORIES = [
  { id: "c1", name: "Debutantes", stageId: "s1", teams: [{ name: "Escuela", suffix: "A" }, { name: "Escuela", suffix: "B" }], players: 20 },
  { id: "c2", name: "Prebenjamín", stageId: "s1", teams: [{ name: "Prebenjamín", suffix: "A" }], players: 12 },
  { id: "c3", name: "Benjamín", stageId: "s2", teams: [{ name: "Benjamín", suffix: "A" }, { name: "Benjamín", suffix: "B" }], players: 24 },
  { id: "c4", name: "Alevín", stageId: "s2", teams: [{ name: "Alevín", suffix: "A" }, { name: "Alevín", suffix: "B" }, { name: "Alevín", suffix: "C" }], players: 36 },
  { id: "c5", name: "Infantil", stageId: "s2", teams: [{ name: "Infantil", suffix: "A" }, { name: "Infantil", suffix: "B" }], players: 30 },
  { id: "c6", name: "Cadete", stageId: "s3", teams: [{ name: "Cadete", suffix: "A" }, { name: "Cadete", suffix: "B" }], players: 40 },
  { id: "c7", name: "Juvenil", stageId: "s3", teams: [{ name: "Juvenil", suffix: "A" }, { name: "Juvenil", suffix: "B" }], players: 44 },
  { id: "c8", name: "Senior", stageId: "s4", teams: [{ name: "Senior", suffix: "B" }, { name: "Senior", suffix: "C" }], players: 38 },
  { id: "c9", name: "Primer Equipo", stageId: "s4", teams: [{ name: "Primer Equipo", suffix: "A" }], players: 25 },
];

// Generar letras de la A a la Z
const ALPHABET = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

export default function AcademyManagementPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sheetMode, setSheetMode] = useState<'category' | 'team'>('category');

  const [formData, setFormData] = useState({
    name: "",
    suffix: "A",
    stageId: "s2",
    parentCategory: "c1",
  });

  const handleOpenSheet = (mode: 'category' | 'team') => {
    setSheetMode(mode);
    setFormData({ name: "", suffix: "A", stageId: "s2", parentCategory: "c1" });
    setIsSheetOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      toast({
        title: sheetMode === 'category' ? "ETAPA_SINCRO" : "EQUIPO_VINCULADO",
        description: `Se ha actualizado la estructura de cantera del club.`,
      });
      setLoading(false);
      setIsSheetOpen(false);
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <div className="flex justify-between items-end border-b border-white/5 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <Sprout className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-[10px] font-black text-primary tracking-[0.5em] uppercase">Academy_Architect_v1.0</span>
          </div>
          <h1 className="text-4xl font-headline font-black text-white uppercase tracking-tighter italic cyan-text-glow">
            Gestión de Cantera
          </h1>
        </div>
        
        <div className="flex gap-4">
          <Button 
            variant="outline"
            onClick={() => handleOpenSheet('category')}
            className="rounded-none border-white/10 text-white/40 font-black uppercase text-[10px] tracking-widest h-12 px-6 hover:bg-white/5"
          >
            <FolderPlus className="h-4 w-4 mr-2" /> Nueva Categoría
          </Button>
          <Button 
            onClick={() => handleOpenSheet('team')}
            className="rounded-none bg-primary text-black font-black uppercase text-[10px] tracking-widest h-12 px-8 shadow-[0_0_20px_rgba(0,242,255,0.3)] hover:scale-105 transition-all border-none"
          >
            <Plus className="h-4 w-4 mr-2" /> Vincular Equipo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AcademyStat label="Total Equipos" value={categories.reduce((acc, cat) => acc + cat.teams.length, 0).toString()} icon={Trophy} />
        <AcademyStat label="Atletas en Formación" value={categories.reduce((acc, cat) => acc + cat.players, 0).toString()} icon={Users} highlight />
        <AcademyStat label="Etapas Metodológicas" value={STAGES.length.toString()} icon={Layers} />
        <AcademyStat label="Sincronización Red" value="100%" icon={Activity} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 pt-4">
        {STAGES.map((stage) => (
          <div key={stage.id} className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", stage.color.replace('text', 'bg'))} />
                <h3 className={cn("text-[11px] font-black uppercase tracking-[0.4em]", stage.color)}>{stage.name}</h3>
              </div>
              <Badge variant="outline" className="text-[8px] font-black border-white/5 text-white/20 uppercase">Stage_{stage.id.toUpperCase()}</Badge>
            </div>

            <div className="space-y-4">
              {categories.filter(c => c.stageId === stage.id).map((cat) => (
                <Card key={cat.id} className="glass-panel border-none bg-black/40 overflow-hidden group hover:bg-black/60 transition-all cursor-default">
                  <CardHeader className="p-6 pb-2">
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-lg font-black text-white italic tracking-tighter uppercase group-hover:cyan-text-glow transition-all">
                        {cat.name}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3 text-white/20" />
                        <span className="text-[10px] font-black text-white/40">{cat.players}</span>
                      </div>
                    </div>
                    <CardDescription className="text-[8px] font-bold text-white/20 uppercase tracking-widest leading-relaxed">
                      {cat.teams.length} Equipos • Fase {stage.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 pt-4">
                    <div className="grid grid-cols-1 gap-2">
                      {cat.teams.map((team, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/5 hover:border-primary/30 transition-all group/team">
                          <div className="flex items-center gap-3">
                            <div className="h-1 w-1 rounded-full bg-primary/40 group-hover/team:bg-primary transition-colors" />
                            <span className="text-[9px] font-black text-white/60 uppercase tracking-tight group-hover/team:text-white">
                              {team.name} <span className="text-primary/60 group-hover/team:text-primary font-black ml-1">[{team.suffix}]</span>
                            </span>
                          </div>
                          <ArrowUpRight className="h-3 w-3 text-white/0 group-hover/team:text-primary group-hover/team:opacity-100 transition-all" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="px-6 py-3 bg-black/40 border-t border-white/5 flex justify-between">
                    <button className="text-[8px] font-black text-white/20 hover:text-primary transition-all flex items-center gap-2 uppercase tracking-widest">
                      <Pencil className="h-2.5 w-2.5" /> Editar
                    </button>
                    <button className="text-[8px] font-black text-white/20 hover:text-rose-400 transition-all flex items-center gap-2 uppercase tracking-widest">
                      <Trash2 className="h-2.5 w-2.5" /> Eliminar
                    </button>
                  </CardFooter>
                </Card>
              ))}

              <Button 
                variant="ghost" 
                onClick={() => handleOpenSheet('category')}
                className="w-full h-12 border border-dashed border-white/5 hover:border-primary/20 bg-transparent text-[8px] font-black text-white/10 hover:text-primary uppercase tracking-[0.3em] transition-all"
              >
                <Plus className="h-3 w-3 mr-2" /> Nueva Categoría
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="bg-[#04070c]/98 backdrop-blur-3xl border-l border-primary/20 text-white w-full sm:max-w-md shadow-[-20px_0_60px_rgba(0,0,0,0.8)] p-0 overflow-hidden flex flex-col">
          <div className="p-10 border-b border-white/5 bg-black/40">
            <SheetHeader className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Academy_Deploy_v1.5</span>
              </div>
              <SheetTitle className="text-4xl font-black italic tracking-tighter text-white uppercase text-left">
                {sheetMode === 'category' ? "CONFIG_CATEGORÍA" : "VINCULAR_EQUIPO"}
              </SheetTitle>
              <SheetDescription className="text-[10px] uppercase font-bold text-white/30 tracking-widest text-left">
                Defina los nodos de formación para la red del club.
              </SheetDescription>
            </SheetHeader>
          </div>

          <form onSubmit={handleSave} className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-10">
            <div className="space-y-8">
              {sheetMode === 'category' ? (
                <>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1">Nombre de la Categoría</Label>
                    <Input 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value.toUpperCase()})}
                      placeholder="EJ: ALEVÍN" 
                      className="h-14 bg-white/5 border-white/10 rounded-none font-bold uppercase focus:border-primary/50 transition-all placeholder:text-white/10 text-lg" 
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1">Etapa Metodológica</Label>
                    <Select 
                      value={formData.stageId} 
                      onValueChange={(v) => setFormData({...formData, stageId: v})}
                    >
                      <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-none text-white/60 font-bold uppercase tracking-widest px-6">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a0f18] border-primary/20 rounded-none">
                        {STAGES.map(s => (
                          <SelectItem key={s.id} value={s.id} className="text-[10px] font-black uppercase tracking-widest focus:bg-primary">
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1">Categoría Federativa</Label>
                    <Select 
                      value={formData.parentCategory} 
                      onValueChange={(v) => setFormData({...formData, parentCategory: v})}
                    >
                      <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-none text-white/60 font-bold uppercase tracking-widest px-6">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a0f18] border-primary/20 rounded-none">
                        {categories.map(c => (
                          <SelectItem key={c.id} value={c.id} className="text-[10px] font-black uppercase tracking-widest focus:bg-primary">
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1">Identificador del Equipo (Letra)</Label>
                    <Select 
                      value={formData.suffix} 
                      onValueChange={(v) => setFormData({...formData, suffix: v})}
                    >
                      <SelectTrigger className="h-16 bg-white/5 border-white/10 rounded-none text-primary font-black text-2xl focus:border-primary/50 transition-all">
                        <div className="flex items-center justify-center w-full gap-3">
                          <Tag className="h-5 w-5 text-primary/40" />
                          <SelectValue placeholder="-" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a0f18] border-primary/20 rounded-none max-h-[300px]">
                        {ALPHABET.map(letter => (
                          <SelectItem key={letter} value={letter} className="text-xl font-black text-white focus:bg-primary">
                            {letter}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-[8px] text-white/20 uppercase font-bold text-center mt-2">Seleccione una letra para distinguir los nodos operativos.</p>
                  </div>
                </>
              )}

              <div className="p-6 bg-primary/5 border border-primary/20 space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-3 w-3 text-primary" />
                  <span className="text-[9px] font-black uppercase text-primary tracking-widest">Protocolo de Organización</span>
                </div>
                <p className="text-[9px] text-white/40 leading-relaxed font-bold uppercase italic">
                  La estructura de cantera define cómo se segmentan los datos tácticos y de asistencia. La separación de identificadores permite un filtrado más preciso por nodos operativos.
                </p>
              </div>
            </div>
          </form>

          <div className="p-10 bg-black/40 border-t border-white/5 flex gap-4">
            <SheetClose asChild>
              <Button variant="ghost" className="flex-1 h-16 border border-white/10 text-white/40 font-black uppercase text-[10px] tracking-widest hover:bg-white/5">
                CANCELAR
              </Button>
            </SheetClose>
            <Button 
              onClick={handleSave}
              disabled={loading}
              className="flex-[2] h-16 bg-primary text-black font-black uppercase text-[10px] tracking-[0.3em] rounded-none shadow-[0_0_30px_rgba(0,242,255,0.2)] hover:scale-[1.02] transition-all border-none"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "SINCRONIZAR_NODO"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function AcademyStat({ label, value, icon: Icon, highlight }: any) {
  return (
    <Card className="glass-panel p-5 flex items-center gap-5 relative overflow-hidden group border-none bg-black/20">
       <div className={cn(
         "h-12 w-12 flex items-center justify-center border transition-all rotate-3 group-hover:rotate-0 duration-500 rounded-2xl",
         highlight ? "bg-primary/10 border-primary/20" : "bg-white/5 border-white/10"
       )}>
          <Icon className={cn("h-6 w-6", highlight ? "text-primary" : "text-white/40")} />
       </div>
       <div className="relative z-10">
          <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">{label}</p>
          <div className="flex items-baseline gap-2">
             <p className={cn(
               "text-2xl font-black italic tracking-tighter",
               highlight ? "text-primary cyan-text-glow" : "text-white"
             )}>{value}</p>
          </div>
       </div>
       <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-10 scan-line" />
    </Card>
  );
}
