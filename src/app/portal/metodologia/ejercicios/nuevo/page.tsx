import { ExerciseEditor } from '@/components/methodology/ExerciseEditor';
import { MethodologySubnav } from '@/components/methodology/MethodologySubnav';
import { getStaffContext } from '@/lib/portal';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function NuevoEjercicioPage() {
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  return (
    <div>
      <h1 className="font-serif-display text-3xl text-white">Nuevo ejercicio</h1>
      <MethodologySubnav />
      <div className="mt-6">
        <ExerciseEditor />
      </div>
    </div>
  );
}
