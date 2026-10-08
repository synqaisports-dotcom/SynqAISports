import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SynqAI Sports — Plataforma para clubes de base',
  description:
    'Pizarra, cantera, metodología y comunicación para clubes de base. El entrenador empieza con lo esencial; el club abre el portal completo.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
