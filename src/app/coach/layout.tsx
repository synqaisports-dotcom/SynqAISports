import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SynqAI Coach Touch Free',
  description:
    'Pizarra gratuita para el entrenador sin club. Fútbol 7 y fútbol sala, 20 ejercicios y una temporada en tu aparato.',
  manifest: '/coach/manifest.webmanifest',
};

export default function CoachLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen synq-mesh-bg text-white print:bg-white print:text-black">{children}</div>;
}
