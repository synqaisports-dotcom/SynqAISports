"use client";

import { AuthProvider, useAuth } from "@/lib/auth-context";
import { DashboardSidebar } from "@/components/dashboard/Sidebar";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2, ShieldAlert, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/config";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
        <div className="relative">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
        </div>
        <p className="text-[10px] font-black text-primary tracking-[0.5em] uppercase">Sincronizando_Terminal...</p>
      </div>
    );
  }

  if (!user) return null;

  // Manejo de identidad no autorizada (NASA Effect Error State)
  if (!profile) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background p-[5%] text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,0,0,0.05),transparent_70%)]" />
        <div className="relative z-10 space-y-6 max-w-md">
          <div className="inline-flex p-6 border border-destructive/50 bg-destructive/5 rounded-sm mb-4">
            <ShieldAlert className="h-12 w-12 text-destructive" />
          </div>
          <h1 className="text-3xl font-headline font-black text-white tracking-tighter">FALLO_DE_AUTORIZACIÓN</h1>
          <div className="space-y-4">
            <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] leading-relaxed">
              La firma digital asociada a <span className="text-white">{user.email}</span> no cuenta con privilegios de acceso en el sector actual.
            </p>
            <div className="p-4 bg-white/5 border border-white/10 text-[9px] font-mono text-left text-white/30 uppercase">
              STATUS: ACCESS_DENIED<br />
              ORIGIN: CLOUD_FIRESTORE_SECURITY_RULES<br />
              ACTION: CONTACT_SYSTEM_ADMINISTRATOR
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full rounded-none border-white/10 text-white/60 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-all font-black text-[10px] tracking-widest h-12"
            onClick={() => signOut(auth)}
          >
            <LogOut className="mr-2 h-4 w-4" /> TERMINAR_SESIÓN
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar />
      <main className="flex-1 ml-64 p-8 overflow-y-auto relative">
        <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-700">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </AuthProvider>
  );
}