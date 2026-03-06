
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
  ArrowRight
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
  SheetClose
} from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function ClubManagementPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const [clubData, setClubData] = useState({
    name: profile?.clubName || profile?.clubId || "Nodo de Cantera",
    country: profile?.country || "España",
    foundation: "2024",
    members: "0",
    website: "www.cantera-synqai.com",
    socials: {
      instagram: "@club_academy",
      youtube: "AcademyTV",
      twitter: "@Academy_ES"
    }
  });

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "NODO_ACTUALIZADO",
      description: "Los parámetros de identidad del club han sido sincronizados.",
    });
    setIsSheetOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 pb-12">
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
        
        <Button 
          onClick={() => setIsSheetOpen(true)}
          className="rounded-none bg-primary text-black font-black uppercase text-[10px] tracking-widest h-12 px-8 shadow-[0_0_20px_rgba(0,242,255,0.3)] hover:scale-105 transition-all border-none"
        >
          <Settings2 className="h-4 w-4 mr-2" /> Configurar Nodo
        </Button>
      </div>

      <div className="relative h-80 rounded-[2rem] overflow-hidden group border border-white/5">
        <Image 
          src="https://picsum.photos/seed/stadium/1200/400" 
          alt="Club Banner" 
          fill 
          className="object-cover opacity-40 group-hover:scale-105 transition-all duration-1000 grayscale group-hover:grayscale-0"
          data-ai-hint="stadium tech"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#04070c] via-transparent to-transparent" />
        
        <div className="absolute -bottom-1 left-12 translate-y-1/2 flex items-end gap-8">
          <div className="relative group/logo">
             <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover/logo:opacity-100 transition-opacity" />
             <div className="h-40 w-40 bg-black border-2 border-primary/40 rounded-[2.5rem] flex items-center justify-center relative z-10 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                <Image 
                  src="https://picsum.photos/seed/clublogo/200/200" 
                  alt="Club Logo" 
                  width={120} 
                  height={120} 
                  className="opacity-80 group-hover/logo:scale-110 transition-transform duration-500"
                  data-ai-hint="sports logo"
                />
                <button className="absolute inset-0 bg-black/60 opacity-0 group-hover/logo:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                   <Camera className="h-6 w-6 text-primary" />
                   <span className="text-[8px] font-black uppercase tracking-widest">Cambiar Escudo</span>
                </button>
             </div>
          </div>
          <div className="pb-4 space-y-1 mb-8">
             <h2 className="text-5xl font-headline font-black text-white uppercase italic tracking-tighter leading-none cyan-text-glow">
               {clubData.name}
             </h2>
             <div className="flex items-center gap-3">
               <MapPin className="h-3 w-3 text-primary" />
               <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{clubData.country} • Sector de Cantera 01</span>
             </div>
          </div>
        </div>

        <div className="absolute top-8 right-8">
           <Button variant="ghost" className="h-10 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl text-white/40 hover:text-primary transition-all">
              <Camera className="h-4 w-4 mr-2" /> Editar Portada
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-24">
        <div className="lg:col-span-2 space-y-8">
           <Card className="glass-panel border-none bg-black/40 overflow-hidden">
             <CardHeader className="border-b border-white/5 p-8">
                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-3">
                  <ShieldCheck className="h-4 w-4 text-primary" /> Atributos de la Entidad
                </CardTitle>
             </CardHeader>
             <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                   <DataNode label="Año de Fundación" value={clubData.foundation} icon={Calendar} />
                   <DataNode label="Capacidad Cantera" value={`${clubData.members} Atletas`} icon={Users} />
                   <DataNode label="Status de Red" value="Sincronizado" icon={Trophy} highlight />
                </div>

                <div className="mt-12 p-8 border border-primary/20 bg-primary/5 rounded-[2rem] space-y-4">
                   <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-primary tracking-widest">Protocolo de Plan Activo</span>
                      <Badge className="bg-primary text-black font-black uppercase text-[8px] px-3">
                        {profile?.plan?.replace('_', ' ') || 'Enterprise Scale'}
                      </Badge>
                   </div>
                   <p className="text-[10px] text-white/40 leading-relaxed uppercase font-bold tracking-wide italic">
                     Nodo centralizado vinculado a la red SynQAI. El escalado de costes se aplicará automáticamente según el volumen de atletas registrados.
                   </p>
                </div>
             </CardContent>
           </Card>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="glass-panel border-none bg-black/40">
                <CardHeader className="p-8 pb-4">
                   <CardTitle className="text-[10px] font-black uppercase tracking-widest text-white/30">Terminales de Contacto</CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8 space-y-4">
                   <ContactLink icon={Globe} label="Portal Web" value={clubData.website} />
                   <ContactLink icon={Mail} label="Mail Administrativo" value={profile?.email || "admin@club.com"} />
                   <ContactLink icon={Smartphone} label="Línea Directa" value="+34 900 000 000" />
                </CardContent>
              </Card>

              <Card className="glass-panel border-none bg-black/40">
                <CardHeader className="p-8 pb-4">
                   <CardTitle className="text-[10px] font-black uppercase tracking-widest text-white/30">Nodos Sociales</CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8 space-y-4">
                   <ContactLink icon={Instagram} label="Instagram" value={clubData.socials.instagram} />
                   <ContactLink icon={Youtube} label="YouTube" value={clubData.socials.youtube} />
                   <ContactLink icon={Twitter} label="Twitter / X" value={clubData.socials.twitter} />
                </CardContent>
              </Card>
           </div>
        </div>

        <div className="space-y-8">
           <Card className="glass-panel border-primary/20 bg-primary/5 p-10 relative group overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all">
                <Share2 className="h-24 w-24 text-primary" />
              </div>
              <h3 className="text-lg font-black italic uppercase tracking-tighter text-white mb-4">Exportar Perfil</h3>
              <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-8 leading-loose">
                Genere un informe PDF de la estructura del club para patrocinadores o federaciones.
              </p>
              <Button className="w-full h-14 bg-black/60 border border-primary/30 text-primary font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-primary hover:text-black transition-all">
                Generar Informe <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
           </Card>

           <div className="p-8 rounded-[2rem] border border-white/5 bg-white/[0.02] space-y-4">
              <div className="flex items-center gap-2">
                 <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Operativa_Activa</span>
              </div>
              <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest leading-relaxed italic">
                La identidad visual de su club es la que verán los padres y atletas en sus terminales portátiles. Mantenga sus datos actualizados.
              </p>
           </div>
        </div>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="bg-[#04070c]/98 backdrop-blur-3xl border-l border-primary/20 text-white w-full sm:max-w-md shadow-[-20px_0_60px_rgba(0,0,0,0.8)] p-0 overflow-hidden flex flex-col">
          <div className="p-8 border-b border-white/5 bg-black/40">
            <SheetHeader className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Identity_Deploy_v2.0</span>
              </div>
              <SheetTitle className="text-3xl font-black italic tracking-tighter text-white uppercase text-left">
                MODIFICAR_NODO
              </SheetTitle>
              <SheetDescription className="text-[10px] uppercase font-bold text-white/30 tracking-widest text-left">
                Ajuste la matriz de información del club para la red.
              </SheetDescription>
            </SheetHeader>
          </div>

          <form onSubmit={handleUpdate} className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1">Nombre de la Entidad</Label>
                <Input 
                  value={clubData.name}
                  onChange={(e) => setClubData({...clubData, name: e.target.value})}
                  className="h-12 bg-white/5 border-white/10 rounded-xl font-bold uppercase focus:border-primary/50" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1">Fundación</Label>
                  <Input 
                    value={clubData.foundation}
                    onChange={(e) => setClubData({...clubData, foundation: e.target.value})}
                    className="h-12 bg-white/5 border-white/10 rounded-xl font-bold uppercase" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1">País</Label>
                  <Input 
                    value={clubData.country}
                    readOnly
                    className="h-12 bg-white/5 border-white/10 rounded-xl font-bold uppercase opacity-50" 
                  />
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-white/5">
                <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1">Instagram (@)</Label>
                <Input 
                  value={clubData.socials.instagram}
                  onChange={(e) => setClubData({...clubData, socials: {...clubData.socials, instagram: e.target.value}})}
                  className="h-12 bg-white/5 border-white/10 rounded-xl font-bold" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1">YouTube</Label>
                <Input 
                  value={clubData.socials.youtube}
                  onChange={(e) => setClubData({...clubData, socials: {...clubData.socials, youtube: e.target.value}})}
                  className="h-12 bg-white/5 border-white/10 rounded-xl font-bold" 
                />
              </div>
            </div>
          </form>

          <div className="p-8 bg-black/40 border-t border-white/5 flex gap-4">
            <SheetClose asChild>
              <Button variant="ghost" className="flex-1 h-14 border border-white/10 text-white/40 font-black uppercase text-[10px] tracking-widest hover:bg-white/5">
                CANCELAR
              </Button>
            </SheetClose>
            <Button 
              onClick={handleUpdate}
              className="flex-[2] h-14 bg-primary text-black font-black uppercase text-[10px] tracking-[0.3em] rounded-xl shadow-[0_0_30px_rgba(0,242,255,0.2)] hover:scale-[1.02] transition-all border-none"
            >
              SINCRONIZAR_CAMBIOS
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function DataNode({ label, value, icon: Icon, highlight }: any) {
  return (
    <div className="space-y-3">
       <div className="flex items-center gap-2">
          <Icon className={cn("h-3 w-3", highlight ? "text-primary" : "text-white/20")} />
          <span className="text-[9px] font-black uppercase tracking-widest text-white/30">{label}</span>
       </div>
       <p className={cn(
         "text-2xl font-black italic tracking-tighter uppercase",
         highlight ? "text-primary cyan-text-glow" : "text-white"
       )}>{value}</p>
    </div>
  );
}

function ContactLink({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-center justify-between group cursor-pointer p-2 hover:bg-white/5 rounded-xl transition-all">
       <div className="flex items-center gap-4">
          <div className="h-9 w-9 bg-white/5 rounded-lg flex items-center justify-center border border-white/5 group-hover:border-primary/40 transition-all">
             <Icon className="h-4 w-4 text-white/40 group-hover:text-primary transition-all" />
          </div>
          <div className="flex flex-col">
             <span className="text-[8px] font-black uppercase text-white/20 tracking-widest">{label}</span>
             <span className="text-[10px] font-bold text-white/80 group-hover:text-white transition-colors">{value}</span>
          </div>
       </div>
       <ArrowUpRight className="h-3 w-3 text-white/5 group-hover:text-primary transition-all" />
    </div>
  );
}
