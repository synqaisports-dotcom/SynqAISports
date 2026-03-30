"use client";

import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type SynqAiSportsLogoProps = {
  compact?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function SynqAiSportsLogo({ compact = false, size = "md", className }: SynqAiSportsLogoProps) {
  const iconWrap =
    size === "lg"
      ? "h-14 w-14 rounded-3xl"
      : size === "sm"
        ? "h-8 w-8 rounded-xl"
        : "h-10 w-10 rounded-2xl";
  const iconSize = size === "lg" ? "h-7 w-7" : size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const synqText = size === "lg" ? "text-[12px]" : size === "sm" ? "text-[9px]" : "text-[10px]";
  const sportsText = size === "lg" ? "text-base" : size === "sm" ? "text-xs" : "text-sm";
  return (
    <div className={cn("inline-flex items-center gap-3", className)}>
      <div className={cn("relative flex items-center justify-center border border-primary/35 bg-black/60", iconWrap)}>
        <div className="absolute inset-0 rounded-[inherit] bg-primary/20 blur-md" />
        <ShieldCheck className={cn("relative z-10 text-primary", iconSize)} />
      </div>
      <div className="leading-none">
        <p className={cn("font-black uppercase tracking-[0.4em] text-primary/70", synqText)}>SynqAI</p>
        {!compact ? (
          <p className={cn("font-black uppercase tracking-[0.18em] text-white", sportsText)}>Sports</p>
        ) : null}
      </div>
    </div>
  );
}
