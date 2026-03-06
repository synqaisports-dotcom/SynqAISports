import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: 'SynqSports Pro | Tecnología Pro para el Fútbol Base',
  description: 'Democratizando las herramientas de élite para canteras y clubes locales. Gestión avanzada al alcance de todos.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <meta name="google-signin-client_id" content="1077364844635-5iflrd2auvb6t79381d9v8tr7ep39st3.apps.googleusercontent.com" />
      </head>
      <body className="font-body antialiased selection:bg-accent/30 selection:text-primary">
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
