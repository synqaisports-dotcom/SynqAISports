'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeModeToggle } from '@/components/portal/ThemeModeToggle';

const labels: Record<string, string> = {
  portal: 'Dashboard',
  club: 'Club',
  cantera: 'Cantera',
  metodologia: 'Metodología',
  config: 'Configuración',
  ejercicios: 'Ejercicios',
  microciclos: 'Microciclos',
  objetivos: 'Objetivos',
  solicitudes: 'Solicitudes',
  nuevo: 'Nuevo',
};

export function PortalHeader() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean).slice(1);

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-background/60 backdrop-blur-md">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/portal">Portal</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {segments.map((segment, index) => {
              const href = `/portal/${segments.slice(0, index + 1).join('/')}`;
              const isLast = index === segments.length - 1;
              const label = labels[segment] ?? segment;
              return (
                <React.Fragment key={href}>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>{label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={href}>{label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex items-center gap-2 px-4">
        <ThemeModeToggle />
      </div>
    </header>
  );
}
