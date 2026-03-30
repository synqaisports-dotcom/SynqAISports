"use client";

import type { ReactNode } from "react";

export function SandboxBoardShell(props: { children: ReactNode }) {
  return (
    <div className="h-[100dvh] w-full bg-[#020408] overflow-hidden relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
      <main className="h-full w-full relative z-10 flex flex-col overflow-hidden">
        {props.children}
      </main>
    </div>
  );
}

