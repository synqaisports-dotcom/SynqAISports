"use client";

import { useState } from "react";
import { 
  ChevronLeft, 
  MessageSquareQuote, 
  Search, 
  ShieldCheck, 
  ArrowRight,
  MoreVertical,
  CheckCheck,
  Zap,
  RefreshCw
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useTutor } from "@/app/tutor/tutor-client-layout";

const MOCK_CHATS = [
  { id: "coach", name: "CARLOS RUIZ", role: "Primer Entrenador", lastMsg: "Recordad que el entreno de mañana es en el anexo por la lluvia.", time: "10:24", unread: 2, avatar: "CR", status: 'online' },
  { id: "club", name: "ADMIN CLUB", role: "Administración", lastMsg: "Sincronización de cuota anual confirmada.", time: "Ayer", unread: 0, avatar: "AC", status: 'offline' },
  { id: "delegate", name: "MARTA LÓPEZ", role: "Delegada Equipo", lastMsg: "Confirmamos autobús para el sábado a las 08:30.", time: "Lun", unread: 0, avatar: "ML", status: 'online' },
];

export default function TutorChatList() {
  const { showAd } = useTutor();

  const handleOpenChat = () => {
    showAd(); 
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#020408]">
      <header className="p-8 bg-[#04070c] border-b border-white/5 space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/tutor/dashboard" className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 active:scale-95 transition-all">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="text-center">
            <h1 className="text-xl font-headline font-black text-white italic tracking-tighter uppercase">MENSAJES</h1>
            <p className="text-[8px] font-black text-primary uppercase tracking-[0.3em] italic">Official_Channels</p>
          </div>
          <button className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
          <Input placeholder="FILTRAR CANALES..." className="h-12 pl-12 bg-white/5 border-white/10 rounded-2xl text-[10px] font-black uppercase focus:border-primary transition-all text-primary placeholder:text-white/10" />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
        <div className="px-4 py-2 flex items-center justify-between">
          <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">Canales Autorizados</span>
          <RefreshCw className="h-3 w-3 text-white/10 animate-spin-slow" />
        </div>
        
        {MOCK_CHATS.map(chat => (
          <div key={chat.id} onClick={handleOpenChat} className="cursor-pointer">
            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-[2rem] flex items-center gap-4 group active:bg-white/5 transition-all relative overflow-hidden">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-active:opacity-100 transition-opacity" />
              <div className={cn(
                "h-14 w-14 rounded-2xl flex items-center justify-center border transition-all text-sm font-headline font-black italic relative shrink-0",
                chat.status === 'online' ? 'bg-primary/10 border-primary/30 text-primary shadow-[0_0_15px_rgba(0,242,255,0.1)]' : 'bg-white/5 border-white/10 text-white/40'
              )}>
                {chat.avatar}
                {chat.status === 'online' && <div className="absolute -top-1 -right-1 h-3 w-3 bg-emerald-500 rounded-full border-2 border-black animate-pulse" />}
              </div>
              <div className="flex-1 min-w-0 space-y-1 relative z-10">
                <div className="flex justify-between items-end">
                  <h4 className="text-xs font-black text-white uppercase italic group-hover:text-primary transition-colors">{chat.name}</h4>
                  <span className="text-[8px] font-bold text-white/20 uppercase">{chat.time}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-tight truncate flex-1 leading-relaxed">
                    {chat.unread === 0 && <CheckCheck className="h-3 w-3 inline mr-1 text-primary/40" />}
                    {chat.lastMsg}
                  </p>
                  {chat.unread > 0 && (
                    <Badge className="h-5 min-w-[20px] bg-primary text-black font-black text-[8px] p-0 flex items-center justify-center rounded-full animate-bounce">
                      {chat.unread}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="p-6 bg-emerald-500/5 border border-dashed border-emerald-500/20 rounded-[2.5rem] flex items-center justify-center gap-4 mt-6 opacity-60">
           <Zap className="h-4 w-4 text-emerald-400 animate-pulse" />
           <span className="text-[8px] font-black text-emerald-400 uppercase tracking-[0.3em]">Patrocinado: Campus de Verano Élite</span>
        </div>
      </div>

      <div className="p-8 border-t border-white/5 bg-[#04070c]/50">
        <div className="flex items-center gap-4 p-4 bg-primary/5 border border-primary/20 rounded-2xl shadow-lg">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <p className="text-[9px] text-primary/60 leading-relaxed font-bold uppercase italic">
            Canal cifrado de punto a punto. Las comunicaciones son oficiales y vinculantes para la red del club.
          </p>
        </div>
      </div>
    </div>
  );
}
