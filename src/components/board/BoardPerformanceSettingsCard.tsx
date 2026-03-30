"use client";

import { useEffect, useState } from "react";
import { Gauge } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  BOARD_PERF_CHANGE_EVENT,
  BOARD_HIGH_PERFORMANCE_KEY,
  readBoardHighPerformance,
  writeBoardHighPerformance,
} from "@/lib/board-performance";

export function BoardPerformanceSettingsCard() {
  const [highPerf, setHighPerf] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setHighPerf(readBoardHighPerformance());
    const onChange = () => setHighPerf(readBoardHighPerformance());
    window.addEventListener(BOARD_PERF_CHANGE_EVENT, onChange);
    const onStorage = (e: StorageEvent) => {
      if (e.key === BOARD_HIGH_PERFORMANCE_KEY) onChange();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(BOARD_PERF_CHANGE_EVENT, onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  if (!mounted) return null;

  return (
    <Card className="glass-panel border-white/10 bg-black/40">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Gauge className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-black uppercase tracking-widest text-white">
            Pizarras tácticas
          </CardTitle>
        </div>
        <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-white/45">
          Menos sombras, resolución de lienzo reducida; útil en tablets modestas.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-4 pt-0">
        <Label htmlFor="synq-high-perf" className="text-[10px] font-black uppercase tracking-wider text-white/70 cursor-pointer">
          Modo Alto Rendimiento
        </Label>
        <Switch
          id="synq-high-perf"
          checked={highPerf}
          onCheckedChange={(v) => {
            writeBoardHighPerformance(v);
            setHighPerf(v);
          }}
        />
      </CardContent>
    </Card>
  );
}
