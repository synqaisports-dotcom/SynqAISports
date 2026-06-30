import Link from 'next/link';
import { MethodologySubnav } from '@/components/methodology/MethodologySubnav';
import { PageContainer } from '@/components/portal/PageContainer';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { redirect } from 'next/navigation';
import { BookOpen, ClipboardList, GitBranch, Layers, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
      href: '/portal/metodologia/ciclos',
      label: 'Ciclos y planograma',
      count: '—',
      icon: GitBranch,
      hint: 'Variantes, equipos y MCC',
    },
    {
      href: '/portal/metodologia/ejercicios',
      label: 'Biblioteca de ejercicios',
      count: exercises.count ?? 0,
      icon: BookOpen,
      hint: 'Fichas UEFA y pizarra',
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
    <PageContainer>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Modelo de juego del club</CardTitle>
          <CardDescription>
            Texto metodológico genérico editable — principios ofensivos, defensivos y transiciones.
            En la siguiente fase se podrá enriquecer con vídeos y documentos.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground leading-relaxed">
          El club trabaja una propuesta de juego basada en la ocupación de espacios, presión tras
          pérdida y salida desde portero. Cada categoría adapta el mismo ADN con progresiones
          técnicas y tácticas acordes a su etapa formativa.
        </CardContent>
      </Card>

      <MethodologySubnav />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ href, label, count, icon: Icon, hint }) => (
          <Card key={href} className="transition-colors hover:border-primary/40">
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <Icon className="h-5 w-5 text-primary" />
              <span className="font-mono text-xl font-bold">{count}</span>
            </CardHeader>
            <CardContent>
              <CardTitle className="mb-1 text-base">{label}</CardTitle>
              <CardDescription className="mb-3">{hint}</CardDescription>
              <Button variant="outline" size="sm" asChild>
                <Link href={href}>Abrir</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
