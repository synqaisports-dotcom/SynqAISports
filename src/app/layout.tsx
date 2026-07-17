import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'SynqAI Sports — Club & Tactics Platform',
    template: '%s · SynqAI Sports',
  },
  description:
    'Ecosistema digital para clubes deportivos: entrenadores, familias, pantallas y gestión. El club cobra 12–24 €/año por niño; SynqAI desde 0,50 €/usuario/mes.',
  icons: {
    icon: [{ url: '/brand/synqai-icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/brand/synqai-icon.svg', type: 'image/svg+xml' }],
  },
  openGraph: {
    title: 'SynqAI Sports — Club & Tactics Platform',
    description:
      'Plataforma 360 para clubes: planificación táctica, portal del entrenador, metodología y gestión.',
    images: [{ url: '/brand/synqai-logo-marketing.png', width: 1024, height: 1024, alt: 'SynqAI' }],
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
