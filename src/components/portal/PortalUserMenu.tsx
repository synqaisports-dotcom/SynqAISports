'use client';

import Link from 'next/link';
import { Home, LogOut } from 'lucide-react';
import { DEMO_ENTRY_PATH } from '@/lib/demo-constants';
import { PortalSignOutMenuItem } from '@/components/portal/PortalSignOutMenuItem';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type Props = {
  clubName: string;
  role: string;
  demoMode?: boolean;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export function PortalUserMenu({ clubName, role, demoMode = false }: Props) {
  const roleLabel = (role || 'admin').replace(/_/g, ' ');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-9 rounded-full" aria-label="Cuenta">
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
              {initials(clubName)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuLabel className="font-normal">
          <p className="font-semibold">{clubName}</p>
          <p className="text-xs capitalize text-muted-foreground">{roleLabel}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Web pública
          </Link>
        </DropdownMenuItem>
        {demoMode ? (
          <DropdownMenuItem asChild>
            <Link href={DEMO_ENTRY_PATH}>
              <LogOut className="mr-2 h-4 w-4" />
              Renovar sesión demo
            </Link>
          </DropdownMenuItem>
        ) : (
          <PortalSignOutMenuItem />
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
