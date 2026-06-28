import { redirect } from 'next/navigation';
import { DemoModeBanner } from '@/components/portal/DemoModeBanner';
import { PortalSidebar } from '@/components/portal/PortalSidebar';
import { isDemoActive, hasServiceRoleKey } from '@/lib/demo';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const demo = await isDemoActive();

  if (!isSupabaseConfigured() && !demo) {
    redirect('/login');
  }

  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);

  if (!ctx) {
    if (demo) {
      redirect('/demo?next=/portal');
    }
    redirect('/login?error=no_club');
  }

  return (
    <div className="synq-mesh-bg flex min-h-screen flex-col">
      {demo && <DemoModeBanner canPersist={hasServiceRoleKey()} clubName={ctx.club.name} />}
      <div className="flex min-h-0 flex-1">
        <PortalSidebar clubName={ctx.club.name} role={ctx.role} demoMode={demo} />
        <main className="flex-1 overflow-auto p-6 md:p-8 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
