"use client";

import { useState } from "react";
import { 
  UserPlus, 
  Search, 
  MoreHorizontal, 
  UserCheck, 
  UserX, 
  Globe2, 
  Mail, 
  Shield,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const MOCK_REQUESTS = [
  { id: "u1", name: "Marc", surname: "García", email: "m.garcia@elite.com", country: "España", status: "Pending", lastSeen: "2m ago" },
  { id: "u2", name: "Elena", surname: "Rossi", email: "e.rossi@milan-training.it", country: "Italia", status: "Approved", lastSeen: "5h ago" },
  { id: "u3", name: "John", surname: "Smith", email: "j.smith@us-soccer.org", country: "USA", status: "Denied", lastSeen: "1d ago" },
  { id: "u4", name: "Lucas", surname: "Silva", email: "l.silva@brasil-academy.br", country: "Brasil", status: "Pending", lastSeen: "Just now" },
];

export default function GlobalUsersPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      {/* HEADER SECTOR */}
      <div className="flex justify-between items-end border-b border-white/5 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-[10px] font-black text-primary tracking-[0.5em] uppercase">Security_Protocol_Active</span>
          </div>
          <h1 className="text-4xl font-headline font-black text-white uppercase tracking-tighter italic cyan-text-glow">
            USER_ACCESS_COMMAND
          </h1>
        </div>
        <Button className="rounded-none bg-primary text-primary-foreground font-black uppercase text-[10px] tracking-widest h-12 px-8 cyan-glow hover:scale-105 transition-all">
          <UserPlus className="h-4 w-4 mr-2" /> Nueva Credencial
        </Button>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricMiniCard label="Solicitudes Pendientes" value="14" color="text-primary" />
        <MetricMiniCard label="Nodos Activos Hoy" value="1.2k" color="text-white" />
        <MetricMiniCard label="Alertas de Acceso" value="0" color="text-emerald-400" />
      </div>

      {/* MAIN DATA TERMINAL */}
      <Card className="glass-panel shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        
        <CardHeader className="bg-black/40 border-b border-white/5 p-6 space-y-4 md:space-y-0 md:flex md:flex-row md:items-center md:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-primary opacity-50" />
            <Input 
              placeholder="BUSCAR IDENTIDAD O PAÍS..." 
              className="pl-10 h-12 bg-white/5 border-white/10 rounded-none text-white placeholder:text-white/20 font-bold uppercase text-[10px] tracking-widest focus-visible:ring-primary/50 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Filtrar por Status:</span>
            <div className="flex gap-1">
              {['Todos', 'Pendiente', 'Activo'].map(f => (
                <button key={f} className="text-[9px] font-black uppercase px-3 py-1 border border-white/5 hover:border-primary/40 text-white/40 hover:text-primary transition-all">
                  {f}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white/[0.02] border-b border-white/5">
              <TableRow className="hover:bg-transparent border-white/5">
                <TableHead className="font-black text-[10px] uppercase tracking-[0.3em] text-white/40 h-14 pl-8">Identidad_Usuario</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-[0.3em] text-white/40">Mail_Acceso</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-[0.3em] text-white/40">Nodo_Pais</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-[0.3em] text-white/40 text-center">Protocolo_Status</TableHead>
                <TableHead className="text-right font-black text-[10px] uppercase tracking-[0.3em] text-white/40 pr-8">Terminal_Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_REQUESTS.map((user) => (
                <TableRow key={user.id} className="border-white/5 hover:bg-white/[0.03] transition-colors group">
                  <TableCell className="pl-8">
                    <div className="flex items-center gap-4 py-2">
                      <div className="h-10 w-10 bg-primary/5 border border-primary/20 flex items-center justify-center relative overflow-hidden group-hover:bg-primary/10 transition-all">
                        <Activity className="h-4 w-4 text-primary opacity-40 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 bg-primary/5 scan-line" />
                      </div>
                      <div>
                        <p className="font-black text-white uppercase text-xs italic group-hover:cyan-text-glow transition-all">
                          {user.name} {user.surname}
                        </p>
                        <p className="text-[8px] text-white/30 font-bold uppercase tracking-widest mt-1">
                          ID: {user.id.toUpperCase()} • {user.lastSeen}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary/60" />
                      <span className="text-xs font-headline font-bold text-primary tracking-wide uppercase">
                        {user.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Globe2 className="h-3 w-3 text-primary/40" />
                      <span className="text-[10px] font-black uppercase text-white/70">{user.country}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <StatusBadge status={user.status} />
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-8">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none border border-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-white/20 hover:text-emerald-400 transition-all">
                        <UserCheck className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none border border-white/5 hover:border-rose-500/50 hover:bg-rose-500/10 text-white/20 hover:text-rose-400 transition-all">
                        <UserX className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none border border-white/5 hover:border-primary/50 hover:bg-primary/10 text-white/20 hover:text-primary transition-all">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <div className="p-4 bg-black/20 border-t border-white/5 flex justify-between items-center text-[8px] font-black text-white/20 uppercase tracking-[0.5em]">
          <span>Mostrando 4 de 1.2k registros</span>
          <span>Sincronización de Base de Datos: Estable</span>
        </div>
      </Card>
    </div>
  );
}

function MetricMiniCard({ label, value, color }: any) {
  return (
    <Card className="glass-panel p-4 relative group overflow-hidden">
      <div className="absolute top-0 right-0 p-2 opacity-5">
        <Activity className="h-8 w-8 text-primary" />
      </div>
      <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/30 mb-1">{label}</p>
      <p className={cn("text-2xl font-black italic", color)}>{value}</p>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    Pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    Approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Denied: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  };
  return (
    <Badge variant="outline" className={cn("rounded-none font-black text-[8px] uppercase tracking-widest px-3 py-1", styles[status])}>
      {status}
    </Badge>
  );
}
