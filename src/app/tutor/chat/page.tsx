
"use client";

import { useState } from "react";
import { 
  ChevronLeft, 
  MessageSquareQuote, 
  Search, 
  Users, 
  ShieldCheck, 
  ArrowRight,
  Clock,
  Zap,
  MoreVertical
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";

const MOCK_CHATS = [
  { id: "coach", name: "CARLOS RUIZ", role: "Primer Entrenador", lastMsg: "¿Podéis traer el peto rojo mañana?", time: "10:24", unread: 2, avatar: "CR" },
  { id: "club", name: "ATENCIÓN CLUB", role: "Administración", lastMsg: "Sincronización de cuota anual...", time: "Ayer", unread: 0, avatar: "SS" },
  { id: "staff", name: "MARTA LÓPEZ", role: "Delegada Equipo", lastMsg: "Confirmamos autobús para el sábado.", time: "Lun", unread: 0, avatar: "ML" },
];

/**
 * Centro de Mensajería Tutor - v1.0.0
 * Estilo WhatsApp para comunicación oficial.
 */
export default function TutorChatList() {
  return (
    <div className="flex-1 flex flex-col h-full bg-[#020408]">
      <header className="p-8 bg-[#04070c] border-b border-white/5 space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/tutor/dashboard" className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 active:scale-95 transition-all">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="text-center">
            <h1 className="text-xl font-headline font-black text-white italic tracking-tighter uppercase">MENSAJERÍA</h1>
            <p className="text-[8px] font-black text-primary uppercase tracking-[0.3em] italic">Centro de Comunicación</p>
          </div>
          <button className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
          <Input placeholder="BUSCAR CONVERSACIÓN..." className="h-12 pl-12 bg-white/5 border-white/5 rounded-2xl text-[10px] font-black uppercase" />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
        <div className="px-4 py-2">
          <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">Canales Oficiales</span>
        </div>
        {MOCK_CHATS.map(chat => (
          <Link key={chat.id} href={`/tutor/chat/${chat.id}`}>
            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-[2rem] flex items-center gap-4 group active:bg-white/5 transition-all">
              <div className={cn(
                "h-14 w-14 rounded-2xl flex items-center justify-center border transition-all text-sm font-headline font-black italic",
                chat.id === 'coach' ? 'bg-primary/10 border-primary/30 text-primary shadow-[0_0_15px_rgba(0,242,255,0.1)]' : 'bg-white/5 border-white/10 text-white/40'
              )}>
                {chat.avatar}
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex justify-between items-end">
                  <h4 className="text-xs font-black text-white uppercase italic group-hover:text-primary transition-colors">{chat.name}</h4>
                  <span className="text-[8px] font-bold text-white/20 uppercase">{chat.time}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-tight truncate flex-1">{chat.lastMsg}</p>
                  {chat.unread > 0 && (
                    <Badge className="h-5 min-w-[20px] bg-primary text-black font-black text-[8px] p-0 flex items-center justify-center rounded-full">
                      {chat.unread}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="p-8 border-t border-white/5 bg-[#04070c]/50">
        <div className="flex items-center gap-4 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
          <ShieldCheck className="h-5 w-5 text-emerald-400" />
          <p className="text-[9px] text-emerald-400/60 leading-relaxed font-bold uppercase italic">
            Solo el personal autorizado puede iniciar chats con las familias.
          </p>
        </div>
      </div>
    </div>
  );
}
