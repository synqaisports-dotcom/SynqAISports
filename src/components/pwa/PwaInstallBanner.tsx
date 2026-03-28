 "use client";
 
 import { useEffect, useMemo, useState } from "react";
 import { Download, X } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { cn } from "@/lib/utils";
 
 type BeforeInstallPromptEvent = Event & {
   prompt: () => Promise<void>;
   userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
 };
 
function dismissKey(scope?: string) {
  const safe = String(scope || "global")
    .trim()
    .slice(0, 40)
    .replace(/[^a-zA-Z0-9._-]/g, "_");
  return `synq_pwa_install_dismissed_v1__${safe}`;
}
 
export function PwaInstallBanner(props: {
  className?: string;
  appName?: string;
  enabled?: boolean;
  storageKeyScope?: string;
}) {
   const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
   const [hidden, setHidden] = useState(false);
   const dismissed = useMemo(() => {
     try {
      return localStorage.getItem(dismissKey(props.storageKeyScope)) === "1";
     } catch {
       return false;
     }
  }, [props.storageKeyScope]);
 
   useEffect(() => {
     const onBeforeInstallPrompt = (e: Event) => {
       e.preventDefault();
       setDeferred(e as BeforeInstallPromptEvent);
     };
     window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
     return () => window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
   }, []);
 
   useEffect(() => {
     if (!deferred) return;
     // Si ya fue instalada, browsers modernos disparan `appinstalled`.
     const onInstalled = () => setHidden(true);
     window.addEventListener("appinstalled", onInstalled);
     return () => window.removeEventListener("appinstalled", onInstalled);
   }, [deferred]);
 
  if (props.enabled === false) return null;
  if (hidden || dismissed || !deferred) return null;
 
   const appName = props.appName ?? "SynqAI";
 
   return (
     <div
       className={cn(
         "fixed bottom-4 left-4 right-4 z-[200] rounded-2xl border border-primary/20 bg-black/70 backdrop-blur-xl p-4 shadow-2xl",
         "sm:left-auto sm:right-6 sm:bottom-6 sm:w-[420px]",
         props.className,
       )}
       role="region"
       aria-label="Instalar aplicación"
     >
       <div className="flex items-start gap-3">
         <div className="mt-0.5 rounded-xl bg-primary/10 p-2 border border-primary/20 shrink-0">
           <Download className="h-4 w-4 text-primary" />
         </div>
         <div className="min-w-0 flex-1">
           <p className="text-xs font-black text-white uppercase tracking-widest">Instalar {appName}</p>
           <p className="mt-1 text-[10px] font-bold uppercase text-white/50 leading-relaxed">
             Acceso rápido, pantalla completa y mejor offline.
           </p>
           <div className="mt-3 flex items-center gap-2">
             <Button
               size="sm"
               className="h-9 bg-primary text-black font-black uppercase text-[10px] tracking-widest"
               onClick={async () => {
                 try {
                   await deferred.prompt();
                   await deferred.userChoice;
                   setHidden(true);
                 } catch {
                   // noop
                 }
               }}
             >
               Instalar
             </Button>
             <Button
               size="sm"
               variant="outline"
               className="h-9 border-white/10 text-white/70 font-black uppercase text-[10px] tracking-widest"
               onClick={() => {
                 try {
                  localStorage.setItem(dismissKey(props.storageKeyScope), "1");
                 } catch {
                   // noop
                 }
                 setHidden(true);
               }}
             >
               Ahora no
             </Button>
           </div>
         </div>
         <button
           type="button"
           className="rounded-lg p-2 text-white/40 hover:text-white hover:bg-white/5"
           aria-label="Cerrar"
           onClick={() => setHidden(true)}
         >
           <X className="h-4 w-4" />
         </button>
       </div>
     </div>
   );
 }
 
