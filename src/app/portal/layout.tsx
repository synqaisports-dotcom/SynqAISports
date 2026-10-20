import { redirect } from 'next/navigation';
import { PortalShell } from '@/components/portal/PortalShell';
import { PortalThemeProvider } from '@/components/portal/PortalThemeProvider';
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
    <PortalThemeProvider>
      <div className="portal-dashboard dark h-svh overflow-hidden">
        <PortalShell
          clubName={ctx.club.name}
          clubLogoUrl={ctx.club.logo_url}
          role={ctx.role}
          demoMode={demo}
          demoCanPersist={hasServiceRoleKey()}
        >
          {children}
        </PortalShell>
      </div>
    </PortalThemeProvider>
  );
}
