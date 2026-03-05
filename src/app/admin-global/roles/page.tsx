"use client";

import { useState } from "react";
import { Fingerprint, Plus, Shield, Check, X, Search, MoreHorizontal, Settings2, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";

const MOCK_ROLES = [
  { id: "r1", name: "Superadmin", users: 3, status: "System", permissions: ["ALL"] },
  { id: "r2", name: "Club Admin", users: 24, status: "Active", permissions: ["Club_Manage", "User_Manage"] },
  { id: "r3", name: "Coach", users: 120, status: "Active", permissions: ["Tactics_Create", "Session_Manage"] },
  { id: "r4", name: "Tutor", users: 45, status: "Active", permissions: ["Consult_Only"] },
];

const PERMISSION_MODULES = [
  { id: "clubs", label: "Gestión de Clubes" },
  { id: "users", label: "Usuarios y Staff" },
  { id: "tactics", label: "Pizarras y Táctica" },
  { id: "billing", label: "Facturación y Planes" },
  { id: "analytics", label: "Métricas Globales" },
];

export default function GlobalRolesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      {/* HEADER SECTOR */}
      <div className="flex justify-between items-end border-b border-white/5 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-1">
            <Fingerprint className="h-5 w-5 text-emerald-400 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-400 tracking-[0.5em] uppercase">Auth_Protocol_Matrix</span>
          </div>
          <h1 className="text-5xl font-headline font-black text-white uppercase tracking-tighter italic emerald-text-glow">
            GESTIÓN DE ROLES
          </h1>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="rounded-2xl bg-emerald-500 text-black font-black uppercase text-[10px] tracking-widest h-14 px-10 shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-105 transition-all border-none">
              <Plus className="h-5 w-5 mr-2" /> Crear Nuevo Rol
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#04070c]/95 backdrop-blur-3xl border border-emerald-500/20 text-white rounded-3xl max-w-2xl shadow-[0_0_100px_rgba(0,0,0,0.8)]">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black italic tracking-tighter text-emerald-400 emerald-text-glow uppercase">Configurar Identidad de Rol</DialogTitle>
              <DialogDescription className="text-[10px] uppercase font-bold text-white/30 tracking-widest">Define el alcance de autoridad para este nodo de usuario.</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-emerald-400/60 tracking-widest ml-1">Identificador de Rol</label>
                <Input placeholder="EJ: ANALISTA_TACTICO" className="h-14 bg-white/5 border-white/10 rounded-2xl font-bold uppercase focus:border-emerald-500/50 transition-all" />
              </div>
              
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-emerald-400/60 tracking-widest block mb-4 ml-1">Matriz de Permisos</label>
                <div className="grid grid-cols-1 gap-3">
                  {PERMISSION_MODULES.map(module => (
                    <div key={module.id} className="flex items-center justify-between p-5 bg-white/[0.03] border border-white/5 rounded-2xl hover:border-emerald-500/30 transition-all group">
                      <span className="text-xs font-bold uppercase tracking-wide group-hover:text-emerald-400 transition-colors">{module.label}</span>
                      <div className="flex gap-4">
                        {['VER', 'CREAR', 'EDIT', 'DEL'].map(action => (
                          <div key={action} className="flex items-center gap-2">
                             <Checkbox className="rounded-md border-emerald-500/40 data-[state=checked]:bg-emerald-500 data-[state=checked]:text-black" />
                             <span className="text-[9px] font-black text-white/40">{action}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button className="w-full h-16 bg-emerald-500 text-black font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:cyan-glow transition-all">Sincronizar Protocolo</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
        {/* MAIN ROLES TABLE */}
        <Card className="glass-panel overflow-hidden border-none relative bg-black/40">
          <CardHeader className="p-8 pb-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-4 h-5 w-5 text-emerald-500 opacity-50" />
              <Input 
                placeholder="BUSCAR IDENTIDAD DE ROL..." 
                className="pl-12 h-14 bg-white/[0.03] border-white/10 rounded-2xl text-white font-bold uppercase text-[11px] tracking-widest focus:ring-emerald-500/30"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-white/[0.01]">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="font-black text-[11px] uppercase tracking-[0.2em] text-white/40 h-16 pl-10">Identidad_Rol</TableHead>
                  <TableHead className="font-black text-[11px] uppercase tracking-[0.2em] text-white/40">Nodos_Asignados</TableHead>
                  <TableHead className="font-black text-[11px] uppercase tracking-[0.2em] text-white/40 text-center">Estatus</TableHead>
                  <TableHead className="text-right font-black text-[11px] uppercase tracking-[0.2em] text-white/40 pr-10">Terminal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_ROLES.map((role) => (
                  <TableRow key={role.id} className="border-white/5 hover:bg-white/[0.03] transition-all group">
                    <TableCell className="pl-10 py-6">
                      <div className="flex items-center gap-5">
                        <div className="h-12 w-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all relative overflow-hidden">
                          <Shield className="h-5 w-5 text-emerald-400 relative z-10" />
                          <div className="absolute inset-0 bg-emerald-500/5 scan-line" />
                        </div>
                        <div>
                          <p className="font-black text-white uppercase text-sm italic group-hover:emerald-text-glow transition-all tracking-tighter">
                            {role.name}
                          </p>
                          <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest mt-1">ID_AUTH: {role.id.toUpperCase()}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                         <Activity className="h-3 w-3 text-emerald-500/30" />
                         <span className="font-mono text-base text-white/80 font-bold">{role.users}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={`rounded-full font-black text-[9px] uppercase tracking-widest px-4 py-1.5 ${role.status === 'System' ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/5' : 'border-white/10 text-white/40'}`}>
                        {role.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-10">
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-white/20 hover:text-emerald-400 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20">
                        <Settings2 className="h-5 w-5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <div className="p-6 bg-black/20 text-[9px] font-black text-white/20 uppercase tracking-[0.4em] flex justify-between rounded-b-3xl">
            <span>Sincronización de matriz activa</span>
            <span>Seguridad Nivel 4</span>
          </div>
        </Card>

        {/* PERMISSIONS INSIGHT */}
        <div className="space-y-6">
          <Card className="glass-panel border-emerald-500/20 bg-emerald-500/[0.03] overflow-hidden group">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-emerald-400 flex items-center gap-3">
                <Shield className="h-4 w-4 animate-pulse" /> Resumen de Auditoría
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="p-6 bg-black/60 rounded-2xl border border-white/5 space-y-2 group-hover:border-emerald-500/30 transition-all">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Roles de Sistema Bloqueados</p>
                <div className="flex items-end gap-3">
                  <p className="text-4xl font-black italic text-white tracking-tighter">02</p>
                  <span className="text-[10px] text-emerald-400 font-bold mb-1 uppercase tracking-widest">Inmutables</span>
                </div>
              </div>
              <div className="p-6 bg-black/60 rounded-2xl border border-white/5 space-y-2 group-hover:border-emerald-500/30 transition-all">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Roles Personalizados</p>
                <div className="flex items-end gap-3">
                  <p className="text-4xl font-black italic text-emerald-400 tracking-tighter">14</p>
                  <span className="text-[10px] text-white/30 font-bold mb-1 uppercase tracking-widest">Activos</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="p-8 rounded-3xl border border-white/5 bg-black/40 space-y-4 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-all">
                <Fingerprint className="h-20 w-20 text-emerald-500" />
             </div>
             <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60">Operativa_Matrix</span>
             </div>
             <p className="text-[10px] text-white/40 leading-relaxed font-bold uppercase italic tracking-wider">
               Los cambios en la matriz de roles afectan a la capacidad de acceso en tiempo real de todos los nodos vinculados. Use con precaución operativa.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}