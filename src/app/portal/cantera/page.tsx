import { CanteraStatsCards } from '@/components/portal/CanteraStatsCards';
import { CanteraStatsCharts } from '@/components/portal/CanteraStatsCharts';
import { PageContainer } from '@/components/portal/PageContainer';
import { demoCanteraMovements, loadCanteraRecentMovements } from '@/lib/cantera-movements';
import { loadCanteraStats } from '@/lib/cantera-stats';
import { isDemoActive } from '@/lib/demo';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { redirect } from 'next/navigation';

export default async function PortalCanteraLandingPage() {
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const demo = await isDemoActive();
  const [stats, movements] = await Promise.all([
    loadCanteraStats(supabase, ctx.club.id),
    demo ? Promise.resolve(demoCanteraMovements()) : loadCanteraRecentMovements(supabase, ctx.club.id),
  ]);

  return (
    <PageContainer>
      <CanteraStatsCards stats={stats} className="mb-4" />

      <CanteraStatsCharts stats={stats} movements={movements} className="mb-6" />
    </PageContainer>
  );
}
