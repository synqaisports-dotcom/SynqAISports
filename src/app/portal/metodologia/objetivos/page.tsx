import { CategoryGoalsPanel, type GoalRow } from '@/components/methodology/CategoryGoalsPanel';
import { MethodologySubnav } from '@/components/methodology/MethodologySubnav';
import { getStaffContext } from '@/lib/portal';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function ObjetivosPage() {
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const { data: goals } = await supabase
    .from('synq_category_goals')
    .select('id, category, season, goals_text')
    .eq('club_id', ctx.club.id)
    .order('season', { ascending: false });

  return (
    <div>
      <h1 className="font-serif-display text-3xl text-white">Objetivos de temporada</h1>
      <p className="mt-2 text-synq-muted">Por categoría y temporada.</p>
      <MethodologySubnav />
      <div className="mt-6">
        <CategoryGoalsPanel goals={(goals ?? []) as GoalRow[]} />
      </div>
    </div>
  );
}
