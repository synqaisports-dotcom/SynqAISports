import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TendenciaCard } from '@/components/TendenciaCard';
import { TrendPulseShell } from '@/components/TrendPulseShell';
import { loadTrendenciaBySlug } from '@/lib/cycle-data';

export const dynamic = 'force-dynamic';

export default async function TendenciaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const candidate = await loadTrendenciaBySlug(slug);
  if (!candidate) notFound();

  return (
    <TrendPulseShell
      title={candidate.canonical_name}
      subtitle="Ficha tendencia · compra en origen antes del patio"
    >
      <p className="mb-4">
        <Link href="/tendencias" className="text-sm text-tp-cyan hover:underline">
          ← Volver a tendencias
        </Link>
      </p>
      <TendenciaCard candidate={candidate} rank={0} />
    </TrendPulseShell>
  );
}
