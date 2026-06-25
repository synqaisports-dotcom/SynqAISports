import Link from 'next/link';
import { MethodologySubnav } from '@/components/methodology/MethodologySubnav';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { redirect } from 'next/navigation';
import { BookOpen, ClipboardList, Layers, Target } from 'lucide-react';

export default async function MetodologiaHomePage() {
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const [exercises, microcycles, goals, pendingRequests] = await Promise.all([
    supabase
      .from('synq_exercises')
      .select('*', { count: 'exact', head: true })
      .eq('club_id', ctx.club.id),
    supabase
      .from('synq_microcycles')
      .select('*', { count: 'exact', head: true })
      .eq('club_id', ctx.club.id),
    supabase
      .from('synq_category_goals')
      .select('*', { count: 'exact', head: true })
      .eq('club_id', ctx.club.id),
    supabase
      .from('synq_change_requests')
      .select('*', { count: 'exact', head: true })
      .eq('club_id', ctx.club.id)
      .eq('status', 'pending'),
  ]);

  const cards = [
    {
      href: '/portal/metodologia/ejercicios',
      label: 'Biblioteca de ejercicios',
      count: exercises.count ?? 0,
      icon: BookOpen,
      hint: 'Crear con pizarra web y metadatos',
    },
    {
      href: '/portal/metodologia/microciclos',
      label: 'Microciclos',
      count: microcycles.count ?? 0,
      icon: Layers,
      hint: 'Plan semanal por equipo',
    },
    {
      href: '/portal/metodologia/objetivos',
      label: 'Objetivos por categoría',
      count: goals.count ?? 0,
      icon: Target,
      hint: 'Temporada y categoría',
    },
    {
      href: '/portal/metodologia/solicitudes',
      label: 'Solicitudes de cambio',
      count: pendingRequests.count ?? 0,
      icon: ClipboardList,
      hint: 'Aprobación director metodología',
    },
  ];

  return (
    <div>
      <h1 className="font-serif-display text-3xl text-white">Metodología</h1>
      <p className="mt-2 text-synq-muted">
        Biblioteca de ejercicios, planificación y objetivos. Las apps de campo consumirán esta
        información en una fase posterior.
      </p>
      <MethodologySubnav />

      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map(({ href, label, count, icon: Icon, hint }) => (
          <Link
            key={href}
            href={href}
            className="rounded-2xl border border-white/5 bg-synq-slate/40 p-5 transition-colors hover:border-synq-accent/30"
          >
            <div className="flex items-start justify-between">
              <Icon className="h-6 w-6 text-synq-accent" />
              <span className="font-mono text-2xl font-bold text-white">{count}</span>
            </div>
            <p className="mt-3 font-semibold text-white">{label}</p>
            <p className="mt-1 text-sm text-synq-muted">{hint}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
