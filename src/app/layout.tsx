import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SynqAI Sports — Plataforma 360 para clubes',
  description:
    'Ecosistema digital para clubes deportivos: entrenadores, familias, pantallas y gestión. El club cobra 12–24 €/año por niño; SynqAI desde 0,50 €/usuario/mes.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
