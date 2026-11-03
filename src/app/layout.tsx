import type { Metadata } from 'next';
import { Exo_2 } from 'next/font/google';
import './globals.css';

const exo2 = Exo_2({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-exo2',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'SynqAI — Club & Tactics Platform',
    template: '%s · SynqAI',
  },
  description:
    'Pizarra, cantera, metodología, torneos y comunicación para clubes de base. El entrenador empieza con lo esencial; el club abre el portal completo.',
  icons: {
    icon: [{ url: '/brand/synqai-icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/brand/synqai-icon.svg', type: 'image/svg+xml' }],
  },
  openGraph: {
    title: 'SynqAI — Club & Tactics Platform',
    description:
      'Plataforma 360 para clubes: planificación táctica, portal del entrenador, metodología y gestión.',
    images: [{ url: '/brand/synqai-logo-marketing.png', width: 1024, height: 1024, alt: 'SynqAI' }],
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={exo2.variable}>
      <body className={`${exo2.className} min-h-screen antialiased`}>{children}</body>
    </html>
  );
}
