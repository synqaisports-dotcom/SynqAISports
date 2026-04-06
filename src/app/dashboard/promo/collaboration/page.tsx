
"use client";

import { useState } from "react";
import { 
  MessageSquareQuote, 
  Sparkles, 
  Send, 
  Gift, 
  Building2, 
  CheckCircle2, 
  Zap, 
  Info,
  ShieldCheck,
  Award,
  ArrowRight,
  Heart
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

/**
 * Terminal de Colaboración Sandbox - v10.2.0
 * Módulo dual para sugerencias de mejora y generación de leads de club.
 */
export default function CollaborationCenterPage() {
  const { toast } = useToast();
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [leadLoading, setLeadLoading] = useState(false);

  const [feedback, setFeedback] = useState("");
  const [clubLead, setLead] = useState({
    clubName: "",
    contactPerson: "",
    email: "",
    position: "Entrenador"
  });

  const addAuditLog = (title: string, desc: string, type: 'Success' | 'Info' = 'Info') => {
    const existingLogs = JSON.parse(localStorage.getItem("synq_audit_logs") || "[]");
    const newLog = {
      id: Date.now().toString(),
      title,
      desc,
      type,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem("synq_audit_logs", JSON.stringify([newLog, ...existingLogs].slice(0, 15)));
  };

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback) return;
    setFeedbackLoading(true);
    
    setTimeout(() => {
      addAuditLog("FEEDBACK_RECIBIDO", `Sugerencia de mejora Sandbox: ${feedback.substring(0, 30)}...`, "Info");
      toast({
        title: "PROPUESTA_ENCRIPTADA",
        description: "Tus ideas han sido enviadas al equipo de desarrollo táctico.",
      });
      setFeedback("");
      setFeedbackLoading(false);
    }, 1500);
  };

  const handleSendLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clubLead.clubName || !clubLead.email) return;
    setLeadLoading(true);
    
    setTimeout(() => {
      addAuditLog("LEAD_ALIANZA_CLUB", `El entrenador ${clubLead.contactPerson} solicita info para: ${clubLead.clubName}`, "Success");
      toast({
        title: "SOLICITUD_DE_ALIANZA",
        description: "Nuestro equipo contactará con tu club. Tu regalo de coach está reservado.",
      });
      setLead({ clubName: "", contactPerson: "", email: "", position: "Entrenador" });
      setLeadLoading(false);
    }, 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 p-8 lg:p-12">
      {/* HEADER ESTRATÉGICO */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-white/5 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <MessageSquareQuote className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-[10px] font-black text-primary tracking-[0.5em] uppercase italic">Collaboration_Terminal_v1.0</span>
          </div>
          <h1 className="text-5xl font-headline font-black text-white uppercase italic tracking-tighter blue-text-glow leading-none">
            MEJORAR_Y_ALIANZAS
          </h1>
          <p className="text-[11px] font-black text-primary/30 tracking-[0.3em] uppercase">Centro de Co-Creación y Alianzas Pro</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* MÓDULO 1: SUGERIR MEJORA (Feedback) */}
        <section className="space-y-8">
          <div className="space-y-2 px-2">
             <div className="flex items-center gap-3">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white">ESCRIBIR_A_DESARROLLO</h3>
             </div>
             <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest italic">¿Qué herramienta táctica necesitas que aún no existe?</p>
          </div>

          <Card className="glass-panel border-white/5 bg-black/40 p-10 rounded-[2.5rem] relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-[background-color,border-color,color,opacity,transform]"><Zap className="h-32 w-32 text-primary" /></div>
             <form onSubmit={handleSendFeedback} className="space-y-6 relative z-10">
                <div className="space-y-3">
                   <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1">Tu Sugerencia Táctica</Label>
                   <Textarea 
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="ME GUSTARÍA PODER EXPORTAR LOS MAPAS DE CALOR..." 
                    className="min-h-[180px] bg-white/5 border-primary/20 rounded-3xl font-bold uppercase text-xs focus:border-primary text-primary placeholder:text-primary/10" 
                   />
                </div>
                <Button disabled={feedbackLoading} className="w-full h-16 bg-primary text-black font-black uppercase text-[11px] tracking-[0.3em] rounded-2xl blue-glow border-none transition-[background-color,border-color,color,opacity,transform]">
                   {feedbackLoading ? "ENVIANDO..." : "ENVIAR AL CENTRO DE MANDO"} <Send className="h-4 w-4 ml-3" />
                </Button>
             </form>
          </Card>

          <div className="p-8 bg-primary/5 border border-primary/20 rounded-[2.5rem] space-y-4">
             <div className="flex items-center gap-3">
                <Info className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-black uppercase text-primary">Comunidad SynqAI</span>
             </div>
             <p className="text-[10px] text-white/40 leading-relaxed font-bold uppercase italic">
               Escuchamos a los entrenadores del barro. Tus ideas son las que dictan la hoja de ruta de la próxima gran actualización.
             </p>
          </div>
        </section>

        {/* MÓDULO 2: IMPULSAR CLUB (Sales Lead) */}
        <section className="space-y-8">
          <div className="space-y-2 px-2">
             <div className="flex items-center gap-3">
                <Gift className="h-4 w-4 text-emerald-400" />
                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-emerald-400">IMPULSA_TU_CLUB_PRO</h3>
             </div>
             <p className="text-[10px] text-emerald-400/40 uppercase font-bold tracking-widest italic">Consigue un regalo por profesionalizar tu cantera</p>
          </div>

          <Card className="glass-panel border-emerald-500/20 bg-emerald-500/[0.02] p-10 rounded-[2.5rem] relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10"><Award className="h-32 w-32 text-emerald-400" /></div>
             
             <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl mb-8 space-y-3 relative z-10">
                <div className="flex items-center gap-3">
                   <ShieldCheck className="h-5 w-5 text-emerald-400" />
                   <span className="text-[11px] font-black uppercase text-white tracking-widest">REGALO_PARA_COACH</span>
                </div>
                <p className="text-[10px] text-white/60 font-bold uppercase leading-relaxed italic">
                  Si nos facilitas el contacto de tu directiva y tu club contrata el modo Pro, desbloquearemos para ti **IA Planner Ilimitado de por vida** como agradecimiento.
                </p>
             </div>

             <form onSubmit={handleSendLead} className="space-y-6 relative z-10">
                <div className="space-y-4">
                   <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase text-emerald-400/60 tracking-widest ml-1">Nombre del Club</Label>
                      <div className="relative">
                         <Building2 className="absolute left-3 top-3 h-4 w-4 text-emerald-400/20" />
                         <Input required value={clubLead.clubName} onChange={(e) => setLead({...clubLead, clubName: e.target.value.toUpperCase()})} placeholder="EJ: CLUB DEPORTIVO CIUDAD" className="pl-10 h-12 bg-black/40 border-emerald-500/20 rounded-xl font-bold uppercase focus:border-emerald-500 text-emerald-400" />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase text-emerald-400/60 tracking-widest ml-1">Tu Nombre (Contacto)</Label>
                      <Input required value={clubLead.contactPerson} onChange={(e) => setLead({...clubLead, contactPerson: e.target.value.toUpperCase()})} placeholder="TU NOMBRE COMPLETO" className="h-12 bg-black/40 border-emerald-500/20 rounded-xl font-bold uppercase focus:border-emerald-500 text-emerald-400" />
                   </div>
                   <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase text-emerald-400/60 tracking-widest ml-1">Email Profesional / Directiva</Label>
                      <Input required type="email" value={clubLead.email} onChange={(e) => setLead({...clubLead, email: e.target.value})} placeholder="DIRECTIVA@CLUB.COM" className="h-12 bg-black/40 border-emerald-500/20 rounded-xl font-bold focus:border-emerald-500 text-emerald-400" />
                   </div>
                </div>
                <Button disabled={leadLoading} className="w-full h-16 bg-emerald-500 text-black font-black uppercase text-[11px] tracking-[0.3em] rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] border-none hover:scale-[1.02] transition-[background-color,border-color,color,opacity,transform]">
                   {leadLoading ? "SOLICITANDO..." : "SOLICITAR INFO PARA MI CLUB"} <ArrowRight className="h-4 w-4 ml-3" />
                </Button>
             </form>
          </Card>

          <div className="p-8 border border-white/5 bg-black/40 rounded-[2.5rem] flex items-center gap-6">
             <Heart className="h-10 w-10 text-rose-500/40" />
             <div className="space-y-1">
                <p className="text-xs font-black text-white uppercase italic">Crecemos Contigo</p>
                <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Al ayudar a tu club a digitalizarse, aseguras el futuro tecnológico de tus atletas.</p>
             </div>
          </div>
        </section>

      </div>
    </div>
  );
}
