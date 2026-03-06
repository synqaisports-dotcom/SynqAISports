
"use client";

import { useAuth } from "@/lib/auth-context";
import { DashboardSidebar } from "@/components/dashboard/Sidebar";
import { Loader2, ChevronsRight, ChevronLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

function BoardTabTrigger() {
  const { state } = useSidebar();
  const isExpanded = state === "expanded";

  return (
    <div 
      className={`fixed top-1/2 -translate-y-1/2 z-[100] transition-all duration-300 ease-in-out ${
        isExpanded ? 'left-[16rem]' : 'left-0'
      }`}
    >
      <SidebarTrigger className="h-24 w-6 rounded-r-xl bg-primary text-black hover:w-8 transition-all shadow-[0_0_30px_rgba(0,242,255,0.5)] flex items-center justify-center border-none p-0 group">
         {isExpanded ? (
           <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
         ) : (
           <ChevronsRight className="h-5 w-5 animate-pulse text-black" />
         )}
      </SidebarTrigger>
      <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-r-xl -z-10 animate-pulse" />
    </div>
  );
}

export default function BoardLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !profile) {
      router.push("/login");
    }
  }, [profile, loading, router]);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#04070c]">
        <div className="relative">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
        </div>
        <p className="text-[10px] font-black text-primary tracking-[0.5em] uppercase">Sincronizando_Terminal_Tactica...</p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen bg-[#04070c] flex w-full relative">
        <DashboardSidebar />

        <BoardTabTrigger />

        <main className="flex-1 flex flex-col overflow-hidden relative">
          <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
          <div className="flex-1 relative z-10 animate-in fade-in duration-700">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
