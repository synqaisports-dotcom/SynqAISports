import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './torneo-pwa.css';

export const metadata: Metadata = {
  title: 'SynqAI Torneos',
  description: 'Torneos en vivo: resultados, mesa móvil, delegados y taquilla.',
  manifest: '/torneo/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SynqAI Torneos',
  },
  icons: {
    icon: [{ url: '/brand/synqai-icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/brand/synqai-icon.svg', type: 'image/svg+xml' }],
  },
};

export const viewport: Viewport = {
  themeColor: '#060a12',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function TorneoPwaLayout({ children }: { children: ReactNode }) {
  return (
    <div className="torneo-pwa synq-mesh-bg dark min-h-dvh text-foreground antialiased">
      {children}
    </div>
  );
}
