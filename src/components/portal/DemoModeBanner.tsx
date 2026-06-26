import Link from 'next/link';

export function DemoModeBanner() {
  return (
    <div
      className="border-b border-amber-500/40 bg-amber-500/15 px-4 py-2 text-center text-sm text-amber-100"
      style={{ color: '#fef3c7' }}
    >
      <strong>Modo demo</strong> — acceso sin login. Los datos pueden ser de prueba.{' '}
      <Link href="/" className="underline hover:text-white">
        Volver a la web
      </Link>
    </div>
  );
}
