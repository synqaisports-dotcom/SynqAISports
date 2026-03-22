
"use client";

import { ReactNode } from "react";

/**
 * Layout exclusivo para la App de Smartwatch.
 * Permite que se instale con su propio manifiesto e icono.
 */
export default function SmartwatchLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#04070c]">
      <head>
        <link rel="manifest" href="/smartwatch/manifest.json" />
        <meta name="apple-mobile-web-app-title" content="Smartwatch by SynqAi" />
      </head>
      {children}
    </div>
  );
}
