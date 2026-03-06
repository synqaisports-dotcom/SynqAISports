
"use client";

import { useState } from "react";
import { 
  Building2, 
  Settings2, 
  Globe, 
  Instagram, 
  Youtube, 
  Twitter, 
  MapPin, 
  Calendar, 
  Users, 
  Plus, 
  Camera, 
  ArrowUpRight,
  ShieldCheck,
  Facebook,
  Share2,
  Mail,
  Smartphone,
  Trophy,
  ArrowRight,
  Dumbbell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import Image from "next/image";

const SPORTS = [
  { value: "Fútbol", label: "Fútbol" },
  { value: "Baloncesto", label: "Baloncesto" },
  { value: "Waterpolo", label: "Waterpolo" },
  { value: "Voleibol", label: "Voleibol" },
  { value: "Balonmano", label: "Balonmano" },
];

export default function ClubManagementPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const [clubData, setClubData] = useState({
    name: profile?.clubName || profile?.clubId || "Nodo de Cantera",
    country: profile?.country || "España",
    sport: profile?.sport || "Fútbol",
    foundation: "2024",
    members: "142",
    website: "www.cantera-synqai.com",
    socials: {
      instagram: "@club_academy",
      youtube: "AcademyTV",
      twitter: "@Academy_ES"
    }
  });

  const handleUpdate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    toast({
      title: "NODO_ACTUALIZADO",
      description: `La identidad de "${clubData.name}" ha sido sincronizada en la red.`,
    });
    setIsSheetOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 pb-24">
      {/* SECCIÓN DE CABECERA Y TÍTULO */}
      <div className="flex justify-between items-end border-b border-white/5 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-[10px] font-black text-primary tracking-[0.5em] uppercase">Club_Identity_Matrix</span>
          </div>
          <h1 className="text-4xl font-headline font-black text-white uppercase tracking-tighter italic cyan-text-glow">
            Gestión del Club
          </h1>
        </div>
        
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button className="rounded-none bg-primary text-black font-black uppercase text-[10px] tracking-widest h-12 px-8 shadow-[0_0_20px_rgba(0,242,255,0.3)] hover:scale-105 transition-all border-none">
              <Settings2 className="h-4 w-4 mr-2" /> Configurar Nodo
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-[#04070c]/98 backdrop-blur-3xl border-l border-primary/20 text-white w-full sm:max-w-md shadow-[-20px_0_60px_rgba(0,0,0,0.8)] p-0 overflow-hidden flex flex-col">
            <div className="p-10 border-b border-white/5 bg-black/40">
              <SheetHeader className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Identity_Deploy_v2.0</span>
                </div>
                <SheetTitle className="text-4xl font-black italic tracking-tighter text-white uppercase text-left">
                  MODIFICAR_NODO
                </SheetTitle>
                <SheetDescription className="text-[10px] uppercase font-bold text-white/30 tracking-widest text-left">
                  Ajuste la matriz de información del club para la red de canteras.
                </SheetDescription>
              </SheetHeader>
            </div>

            <form onSubmit={handleUpdate} className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-10">
              <div className="space-y-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1">Nombre de la Entidad</Label>
                  <Input 
                    value={clubData.name}
                    onChange={(e) => setClubData({...clubData, name: e.target.value.toUpperCase()})}
                    className="h-14 bg-white/5 border-white/10 rounded-2xl font-bold uppercase focus:border-primary/50 text-lg" 
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1">Disciplina Deportiva</Label>
                  <Select 
                    value={clubData.sport} 
                    onValueChange={(v) => setClubData({...clubData, sport: v})}
                  >
                    <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-2xl text-white font-bold uppercase tracking-widest px-6">
                      <SelectValue placeholder="DEPORTE..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0f18] border-primary/20 rounded-2xl">
                      {SPORTS.map(s => (
                        <SelectItem key={s.value} value={s.value} className="text-[10px] font-black uppercase tracking-widest focus:bg-primary">
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1">Fundación</Label>
                    <Input 
                      value={clubData.foundation}
                      onChange={(e) => setClubData({...clubData, foundation: e.target.value})}
                      className="h-14 bg-white/5 border-white/10 rounded-2xl font-bold uppercase" 
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1">Capacidad (Atletas)</Label>
                    <Input 
                      value={clubData.members}
                      onChange={(e) => setClubData({...clubData, members: e.target.value})}
                      className="h-14 bg-white/5 border-white/10 rounded-2xl font-bold uppercase" 
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1">Portal Web</Label>
                  <Input 
                    value={clubData.website}
                    onChange={(e) => setClubData({...clubData, website: e.target.value})}
                    className="h-14 bg-white/5 border-white/10 rounded-2xl font-bold" 
                  />
                </div>

                <div className="space-y-3 pt-6 border-t border-white/5">
                  <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1">Instagram (@)</Label>
                  <Input 
                    value={clubData.socials.instagram}
                    onChange={(e) => setClubData({...clubData, socials: {...clubData.socials, instagram: e.target.value}})}
                    className="h-14 bg-white/5 border-white/10 rounded-2xl font-bold" 
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1">YouTube</Label>
                  <Input 
                    value={clubData.socials.youtube}
                    onChange={(e) => setClubData({...clubData, socials: {...clubData.socials, youtube: e.target.value}})}
                    className="h-14 bg-white/5 border-white/10 rounded-2xl font-bold" 
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1">Twitter / X</Label>
                  <Input 
                    value={clubData.socials.twitter}
                    onChange={(e) => setClubData({...clubData, socials: {...clubData.socials, twitter: e.target.value}})}
                    className="h-14 bg-white/5 border-white/10 rounded-2xl font-bold" 
                  />
                </div>
              </div>
            </form>

            <div className="p-10 bg-black/40 border-t border-white/5 flex gap-6">
              <SheetClose asChild>
                <Button variant="ghost" className="flex-1 h-16 border border-white/10 text-white/40 font-black uppercase text-[11px] tracking-widest hover:bg-white/5 rounded-2xl">
                  CANCELAR
                </Button>
              </SheetClose>
              <Button 
                onClick={() => handleUpdate()}
                className="flex-[2] h-16 bg-primary text-black font-black uppercase text-[11px] tracking-[0.3em] rounded-2xl shadow-[0_0_30px_rgba(0,242,255,0.2)] hover:scale-[1.02] transition-all border-none"
              >
                SINCRONIZAR_CAMBIOS
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* BANNER VISUAL */}
      <div className="relative h-80 rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl">
        <Image 
          src="https://picsum.photos/seed/stadium/1200/400" 
          alt="Club Banner" 
          fill 
          className="object-cover opacity-40 grayscale"
          data-ai-hint="stadium tech"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#04070c] via-transparent to-transparent" />
        <div className="absolute top-8 right-8">
           <Button variant="ghost" className="h-10 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl text-white/40 hover:text-primary transition-all">
              <Camera className="h-4 w-4 mr-2" /> Editar Portada
           </Button>
        </div>
      </div>

      {/* IDENTIDAD DEL CLUB (BLOQUE DE FLUJO CON MARGEN NEGATIVO ELEVADO) */}
      <div className="px-12 -mt-44 relative z-20 space-y-6 mb-24">
        <div className="flex flex-col md:flex-row items-end gap-10">
          <div className="relative group/logo">
             <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full opacity-0 group-hover/logo:opacity-100 transition-opacity" />
             <div className="h-56 w-52 bg-black border-2 border-primary/40 rounded-[3.5rem] flex items-center justify-center relative z-10 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.9)] group-hover/logo:border-primary transition-all duration-500">
                <Image 
                  src="https://picsum.photos/seed/clublogo/300/300" 
                  alt="Club Logo" 
                  width={180} 
                  height={180} 
                  className="opacity-90 group-hover/logo:scale-110 transition-transform duration-700"
                  data-ai-hint="sports logo"
                />
                <button className="absolute inset-0 bg-black/60 opacity-0 group-hover/logo:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                   <Camera className="h-6 w-6 text-primary" />
                   <span className="text-[10px] font-black uppercase tracking-[0.2em]">Sincronizar Escudo</span>
                </button>
             </div>
          </div>
          
          <div className="pb-6 space-y-4">
             <div className="space-y-1">
                <span className="text-[10px] font-black text-primary/60 uppercase tracking-[0.5em] ml-1">Identidad de Nodo</span>
                <h2 className="text-6xl lg:text-7xl font-headline font-black text-white uppercase italic tracking-tighter leading-[0.85] cyan-text-glow drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
                  {clubData.name}
                </h2>
             </div>
             <div className="flex items-center gap-4 px-1">
               <div className="flex items-center gap-2">
                 <Dumbbell className="h-3.5 w-3.5 text-primary" />
                 <span className="text-[11px] font-black text-primary uppercase tracking-widest">{clubData.sport}</span>
               </div>
               <div className="h-1 w-1 rounded-full bg-white/10" />
               <div className="flex items-center gap-2">
                 <MapPin className="h-3.5 w-3.5 text-white/40" />
                 <span className="text-[11px] font-black text-white/40 uppercase tracking-widest">{clubData.country}</span>
               </div>
               <div className="h-1 w-1 rounded-full bg-white/10" />
               <span className="text-[11px] font-black text-white/20 uppercase tracking-[0.3em]">Protocolo Activo</span>
             </div>
          </div>
        </div>
      </div>

      {/* MATRIZ DE DATOS Y TERMINALES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 pt-8">
        <div className="lg:col-span-2 space-y-10">
           <Card className="glass-panel border-none bg-black/40 overflow-hidden shadow-2xl">
             <CardHeader className="border-b border-white/5 p-10">
                <CardTitle className="text-xs font-black uppercase tracking-[0.4em] flex items-center gap-4 text-white/60">
                  <ShieldCheck className="h-5 w-5 text-primary" /> Atributos de la Entidad
                </CardTitle>
             </CardHeader>
             <CardContent className="p-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                   <DataNode label="Disciplina" value={clubData.sport} icon={Dumbbell} highlight />
                   <DataNode label="Año de Fundación" value={clubData.foundation} icon={Calendar} />
                   <DataNode label="Capacidad Cantera" value={`${clubData.members} Atletas`} icon={Users} />
                </div>

                <div className="mt-16 p-10 border border-primary/20 bg-primary/5 rounded-[2.5rem] space-y-5 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-4 opacity-5">
                      <Trophy className="h-32 w-32 text-primary" />
                   </div>
                   <div className="flex items-center justify-between relative z-10">
                      <span className="text-[11px] font-black uppercase text-primary tracking-[0.3em]">Protocolo de Plan Activo</span>
                      <Badge className="bg-primary text-black font-black uppercase text-[9px] px-4 py-1.5 tracking-widest rounded-none">
                        {profile?.plan?.replace('_', ' ') || 'Enterprise Scale'}
                      </Badge>
                   </div>
                   <p className="text-[11px] text-white/40 leading-relaxed uppercase font-bold tracking-widest italic relative z-10 max-w-2xl">
                     Nodo centralizado vinculado a la red SynQAI. El sistema optimiza automáticamente los recursos según el volumen de atletas en formación detectado en este nodo.
                   </p>
                </div>
             </CardContent>
           </Card>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <Card className="glass-panel border-none bg-black/40 shadow-xl">
                <CardHeader className="p-10 pb-4">
                   <CardTitle className="text-[11px] font-black uppercase tracking-[0.4em] text-white/20">Terminales de Contacto</CardTitle>
                </CardHeader>
                <CardContent className="px-10 pb-10 space-y-5">
                   <ContactLink icon={Globe} label="Portal Web" value={clubData.website} />
                   <ContactLink icon={Mail} label="Mail Administrativo" value={profile?.email || "admin@club.com"} />
                   <ContactLink icon={Smartphone} label="Línea Directa" value="+34 900 000 000" />
                </CardContent>
              </Card>

              <Card className="glass-panel border-none bg-black/40 shadow-xl">
                <CardHeader className="p-10 pb-4">
                   <CardTitle className="text-[11px] font-black uppercase tracking-[0.4em] text-white/20">Nodos Sociales</CardTitle>
                </CardHeader>
                <CardContent className="px-10 pb-10 space-y-5">
                   <ContactLink icon={Instagram} label="Instagram" value={clubData.socials.instagram} />
                   <ContactLink icon={Youtube} label="YouTube" value={clubData.socials.youtube} />
                   <ContactLink icon={Twitter} label="Twitter / X" value={clubData.socials.twitter} />
                </CardContent>
              </Card>
           </div>
        </div>

        <div className="space-y-10">
           <Card className="glass-panel border-primary/20 bg-primary/5 p-12 relative group overflow-hidden shadow-[0_0_50px_rgba(0,242,255,0.05)]">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all">
                <Share2 className="h-32 w-32 text-primary" />
              </div>
              <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-6">Exportar Perfil</h3>
              <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-10 leading-loose">
                Genere un informe PDF técnico de la estructura del club para patrocinadores, federaciones o redes de formación.
              </p>
              <Button className="w-full h-16 bg-black/60 border border-primary/30 text-primary font-black uppercase text-[11px] tracking-[0.2em] rounded-2xl hover:bg-primary hover:text-black transition-all shadow-xl">
                Generar Informe <ArrowRight className="h-4 w-4 ml-3" />
              </Button>
           </Card>

           <div className="p-10 rounded-[3rem] border border-white/5 bg-white/[0.02] space-y-5 relative overflow-hidden">
              <div className="absolute inset-0 bg-grid-pattern opacity-5" />
              <div className="flex items-center gap-3 relative z-10">
                 <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                 <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white/60">Operativa_Activa</span>
              </div>
              <p className="text-[11px] text-white/20 uppercase font-bold tracking-widest leading-relaxed italic relative z-10">
                La identidad visual de su nodo es el núcleo de confianza para las familias. Mantenga el escudo y los datos actualizados para garantizar la integridad de la red.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}

function DataNode({ label, value, icon: Icon, highlight }: any) {
  return (
    <div className="space-y-4">
       <div className="flex items-center gap-3">
          <Icon className={cn("h-4 w-4", highlight ? "text-primary" : "text-white/20")} />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">{label}</span>
       </div>
       <p className={cn(
         "text-3xl font-black italic tracking-tighter uppercase",
         highlight ? "text-primary cyan-text-glow" : "text-white"
       )}>{value}</p>
    </div>
  );
}

function ContactLink({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-center justify-between group cursor-pointer p-3 hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/5">
       <div className="flex items-center gap-5">
          <div className="h-11 w-11 bg-white/5 rounded-xl flex items-center justify-center border border-white/5 group-hover:border-primary/40 transition-all">
             <Icon className="h-5 w-5 text-white/40 group-hover:text-primary transition-all" />
          </div>
          <div className="flex flex-col">
             <span className="text-[9px] font-black uppercase text-white/20 tracking-widest">{label}</span>
             <span className="text-[11px] font-bold text-white/80 group-hover:text-white transition-colors uppercase tracking-tight">{value}</span>
          </div>
       </div>
       <ArrowUpRight className="h-4 w-4 text-white/5 group-hover:text-primary transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </div>
  );
}
