"use client";

import { useState } from "react";
import { Fingerprint, Plus, Shield, Check, X, Search, MoreHorizontal, Settings2 } from "lucide-react";
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
      <div className="flex justify-between items-end border-b border-white/5 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <Fingerprint className="h-5 w-5 text-emerald-400 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-400 tracking-[0.5em] uppercase">Auth_Protocol_Matrix</span>
          </div>
          <h1 className="text-4xl font-headline font-black text-white uppercase tracking-tighter italic emerald-text-glow">
            GESTIÓN DE ROLES
          </h1>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="rounded-none bg-emerald-500 text-black font-black uppercase text-[10px] tracking-widest h-12 px-8 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 transition-all border-none">
              <Plus className="h-4 w-4 mr-2" /> Crear Nuevo Rol
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#04070c] border border-emerald-500/20 text-white rounded-none max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black italic tracking-tighter text-emerald-400 emerald-text-glow uppercase">Configurar Identidad de Rol</DialogTitle>
              <DialogDescription className="text-[10px] uppercase font-bold text-white/30 tracking-widest">Define el alcance de autoridad para este nodo de usuario.</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-emerald-400/60 tracking-widest">Identificador de Rol</label>
                <Input placeholder="EJ: ANALISTA_TACTICO" className="h-12 bg-white/5 border-white/10 rounded-none font-bold uppercase" />
              </div>
              
              <div className="space-y-4">
                <label className="text-[9px] font-black uppercase text-emerald-400/60 tracking-widest block mb-4">Matriz de Permisos</label>
                <div className="grid grid-cols-1 gap-4">
                  {PERMISSION_MODULES.map(module => (
                    <div key={module.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 hover:border-emerald-500/20 transition-all">
                      <span className="text-xs font-bold uppercase tracking-wide">{module.label}</span>
                      <div className="flex gap-4">
                        {['VER', 'CREAR', 'EDIT', 'DEL'].map(action => (
                          <div key={action} className="flex items-center gap-2">
                             <Checkbox className="border-emerald-500/40 data-[state=checked]:bg-emerald-500 data-[state=checked]:text-black" />
                             <span className="text-[8px] font-black text-white/40">{action}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button className="w-full h-14 bg-emerald-500 text-black font-black uppercase text-[10px] tracking-widest rounded-none shadow-[0_0_15px_rgba(16,185,129,0.2)]">Sincronizar Protocolo</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
        {/* MAIN ROLES TABLE */}
        <Card className="glass-panel overflow-hidden relative">
          <CardHeader className="bg-black/40 border-b border-white/5 p-6">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-emerald-500 opacity-50" />
              <Input 
                placeholder="BUSCAR IDENTIDAD DE ROL..." 
                className="pl-10 h-12 bg-white/5 border-white/10 rounded-none text-white font-bold uppercase text-[10px] tracking-widest"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-white/[0.02]">
                <TableRow className="border-white/5">
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-white/40 h-14 pl-8">Identidad_Rol</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-white/40">Nodos_Asignados</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-white/40">Estatus_Sistema</TableHead>
                  <TableHead className="text-right font-black text-[10px] uppercase tracking-widest text-white/40 pr-8">Terminal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_ROLES.map((role) => (
                  <TableRow key={role.id} className="border-white/5 hover:bg-white/[0.03] transition-colors group">
                    <TableCell className="pl-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-center rotate-45 group-hover:bg-emerald-500/10 transition-all">
                          <Shield className="h-4 w-4 text-emerald-500 -rotate-45" />
                        </div>
                        <div>
                          <p className="font-black text-white uppercase text-xs italic group-hover:emerald-text-glow transition-all">
                            {role.name}
                          </p>
                          <p className="text-[8px] text-white/30 font-bold uppercase tracking-widest mt-1">ID: {role.id.toUpperCase()}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm text-white/80">{role.users}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`rounded-none font-black text-[8px] uppercase tracking-widest px-3 py-1 ${role.status === 'System' ? 'border-emerald-500 text-emerald-400' : 'border-white/10 text-white/40'}`}>
                        {role.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-white/20 hover:text-emerald-400">
                        <Settings2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* PERMISSIONS INSIGHT */}
        <div className="space-y-6">
          <Card className="glass-panel border-emerald-500/20 bg-emerald-500/[0.02]">
            <CardHeader>
              <CardTitle className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                <Shield className="h-4 w-4" /> Resumen de Auditoría
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-black/40 border border-white/5 space-y-2">
                <p className="text-[10px] font-black text-white/60 uppercase">Roles de Sistema Bloqueados</p>
                <p className="text-2xl font-black italic text-white">02</p>
                <p className="text-[8px] text-white/20 uppercase tracking-widest font-bold">No editables por protocolo base</p>
              </div>
              <div className="p-4 bg-black/40 border border-white/5 space-y-2">
                <p className="text-[10px] font-black text-white/60 uppercase">Roles Personalizados</p>
                <p className="text-2xl font-black italic text-emerald-400">14</p>
                <p className="text-[8px] text-white/20 uppercase tracking-widest font-bold">Distribuidos en la red global</p>
              </div>
            </CardContent>
          </Card>

          <div className="p-6 border border-white/5 bg-black/20 space-y-4">
             <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">Sincronización_Matrix</span>
             </div>
             <p className="text-[9px] text-white/30 leading-relaxed font-medium uppercase italic">
               Los cambios en la matriz de roles afectan a la capacidad de acceso en tiempo real de todos los nodos vinculados. Use con precaución operativa.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
