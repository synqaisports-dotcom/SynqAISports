'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function PortalConfigButton() {
  const pathname = usePathname();
  const active =
    pathname === '/portal/config' || pathname.startsWith('/portal/config/');

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        'size-9 text-muted-foreground hover:text-foreground',
        active &&
          'bg-primary/12 text-primary shadow-[inset_0_0_0_1px_hsl(183_100%_50%_/_0.35)]'
      )}
      asChild
    >
      <Link href="/portal/config" aria-label="Configuración" aria-current={active ? 'page' : undefined}>
        <Settings className="size-4" />
      </Link>
    </Button>
  );
}
