import { redirect } from 'next/navigation';
import { DemoModeBanner } from '@/components/portal/DemoModeBanner';
import { PortalSidebar } from '@/components/portal/PortalSidebar';
import { isDemoActive } from '@/lib/demo';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured() && !(await isDemoActive())) {
    redirect('/login');
  }

  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  const demo = await isDemoActive();

  if (!ctx) {
    redirect('/login?error=no_club');
  }

  return (
    <div className="flex min-h-screen flex-col bg-synq-navy">
      {demo && <DemoModeBanner />}
      <div className="flex min-h-0 flex-1">
        <PortalSidebar clubName={ctx.club.name} role={ctx.role} demoMode={demo} />
        <main
          className="flex-1 overflow-auto p-6 md:p-8"
          style={{ color: '#e8edf4', backgroundColor: '#0a1628' }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
