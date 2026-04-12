import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/lib/auth-context";
import { I18nProvider } from "@/contexts/i18n-context";
import { LocalDataBootstrap } from "@/components/local-data/LocalDataBootstrap";

export const themeColor = '#04070c';
export const viewport = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0';

export const metadata: Metadata = {
  title: 'SynqSports Pro',
  description: 'Tecnología Pro para todo el Deporte Base',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SynqAi Pro'
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-touch-fullscreen': 'yes',
  } as unknown as Metadata['other'],
  icons: {
    apple: [
      { url: 'https://placehold.co/192x192/04070c/00f2ff?text=SynqAi', sizes: '192x192', type: 'image/png' },
    ],
  }
};

export default async function RootLayout(props: {
  children: React.ReactNode;
}) {
  const children = props.children;

  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <meta name="google-signin-client_id" content="1077364844635-5iflrd2auvb6t79381d9v8tr7ep39st3.apps.googleusercontent.com" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('SW registered: ', registration.scope);
                  }).catch(function(err) {
                    console.log('SW registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
      </head>
      <body className="font-body antialiased selection:bg-accent/30 selection:text-primary">
        <AuthProvider>
          <I18nProvider>
            <LocalDataBootstrap />
            {children}
            <Toaster />
          </I18nProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
