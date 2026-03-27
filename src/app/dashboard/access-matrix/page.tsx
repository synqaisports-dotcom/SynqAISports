"use client";

import Link from "next/link";
import { LayoutGrid, ShieldCheck, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { useClubAccessMatrix } from "@/contexts/club-access-matrix-context";
import { AccessMatrixCuadroMando } from "@/components/admin/AccessMatrixCuadroMando";

export default function DashboardAccessMatrixPage() {
  const { profile } = useAuth();
  const { normalizedMatrix, loading } = useClubAccessMatrix();

  const allowed = profile && ["superadmin", "club_admin", "academy_director"].includes(profile.role);

  if (!allowed) {
    return (
      <div className="p-12 text-center text-white/40 font-bold uppercase text-[10px] tracking-widest">
        Sin permiso para ver el cuadro de mando de accesos.
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <LayoutGrid className="h-5 w-5 text-primary" />
            <span className="text-[10px] font-black text-primary tracking-[0.4em] uppercase">Cuadro_Mando_Accesos</span>
          </div>
          <h1 className="text-3xl font-headline font-black text-white uppercase tracking-tighter italic">
            Matriz del club (vista ejecutiva)
          </h1>
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest max-w-xl leading-relaxed">
            Columnas agrupadas: operaciones del club y metodología (ejercicios, planner, pizarras). La edición con toggles está en Admin &amp; Permisos.
          </p>
        </div>
        <Button
          asChild
          className="rounded-none bg-primary text-black font-black uppercase text-[10px] tracking-widest h-12 px-6 shadow-[0_0_20px_rgba(0,242,255,0.25)]"
        >
          <Link href="/dashboard/admin" className="inline-flex items-center gap-2">
            <Settings2 className="h-4 w-4" /> Admin &amp; Permisos
          </Link>
        </Button>
      </div>

      <Card className="glass-panel border border-primary/20 bg-black/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white uppercase italic text-lg">
            <ShieldCheck className="h-5 w-5 text-primary" /> Estado actual
          </CardTitle>
          <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-white/30">
            {loading ? "Sincronizando con Supabase / local…" : "Datos normalizados según jerarquía estándar del club."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AccessMatrixCuadroMando matrix={normalizedMatrix} theme="cyan" />
        </CardContent>
      </Card>
    </div>
  );
}
