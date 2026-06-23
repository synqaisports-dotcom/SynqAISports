import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TrendPulse — Delay Intelligence',
  description: 'Motor de predicción de tendencias por arbitraje temporal geográfico.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
