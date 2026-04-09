"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/plataforma", label: "Plataforma" },
  { href: "/apps", label: "Apps" },
  { href: "/precios", label: "Precios" },
  { href: "/contacto", label: "Contacto" },
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#171b22]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-6">
        <Link href="/" className="inline-flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-black">
            <Zap className="h-5 w-5" />
          </span>
          <span className="text-2xl font-black uppercase italic tracking-tight">
            Synq<span className="text-primary">AI</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-[11px] font-black uppercase tracking-[0.2em] transition-colors",
                  active ? "text-primary" : "text-white/65 hover:text-white",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" className="border-white/15 bg-[#262d38] text-white hover:bg-[#313948]">
            <Link href="/store">Store</Link>
          </Button>
          <Button asChild className="bg-primary text-black font-black uppercase tracking-widest text-[10px]">
            <Link href="/login">Acceso</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
