import { redirect } from 'next/navigation';
import { PortalSidebar } from '@/components/portal/PortalSidebar';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) {
    redirect('/login');
  }

  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);

  if (!ctx) {
    redirect('/login?error=no_club');
  }

  return (
    <div className="flex min-h-screen bg-synq-navy">
      <PortalSidebar clubName={ctx.club.name} role={ctx.role} />
      <main className="flex-1 overflow-auto p-6 md:p-8">{children}</main>
    </div>
  );
}
