'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function PortalSignOutButton() {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={() => void signOut()}
      className="w-full rounded-lg px-3 py-2 text-left text-sm text-synq-muted hover:bg-white/5 hover:text-white"
      style={{ color: '#94a3b8' }}
    >
      Cerrar sesión
    </button>
  );
}
