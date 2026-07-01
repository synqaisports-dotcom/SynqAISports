'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { createClient } from '@/lib/supabase/client';

export function PortalSignOutMenuItem() {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <DropdownMenuItem onClick={() => void signOut()}>
      <LogOut className="mr-2 h-4 w-4" />
      Cerrar sesión
    </DropdownMenuItem>
  );
}
