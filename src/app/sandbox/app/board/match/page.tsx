"use client";

import MatchBoardPage from "@/app/board/match/page";

export default function SandboxAppMatchBoardPage() {
  // Reutilizamos la pizarra de partido, pero dentro del scope /sandbox/app.
  // Esto evita que la PWA “salte” fuera de la micro-app al abrir un partido.
  return <MatchBoardPage />;
}

