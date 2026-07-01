'use client';

import Link from 'next/link';
import { Bell } from 'lucide-react';
import { DEMO_ENTRY_PATH } from '@/lib/demo-constants';
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
  canPersist: boolean;
  clubName?: string;
};

export function DemoModeBell({ canPersist, clubName }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative size-9 text-primary"
          aria-label="Avisos del entorno de pruebas"
        >
          <Bell className="size-4" />
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 border-primary/30">
        <DropdownMenuLabel className="font-normal">
          <p className="font-semibold text-primary">Modo pruebas</p>
          <p className="mt-1 text-xs font-normal text-muted-foreground">
            {clubName ? `${clubName} · ` : ''}
            Sin contraseña. Entorno de demostración.
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-xs leading-relaxed text-muted-foreground">
          {canPersist ? (
            <p>Los cambios se guardan en Supabase.</p>
          ) : (
            <p>
              Solo vista previa. Añade <code className="text-primary">SUPABASE_SERVICE_ROLE_KEY</code>{' '}
              en Vercel para guardar datos.
            </p>
          )}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/">Ir a la web pública</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={DEMO_ENTRY_PATH}>Renovar sesión demo</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
