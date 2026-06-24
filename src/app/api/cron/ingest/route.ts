import { NextResponse } from 'next/server';

/**
 * Cron Fase 2 — ingesta cada 48h (stub).
 * Vercel: añadir CRON_SECRET en env y configurar cron en vercel.json.
 * Por ahora solo confirma que el endpoint está vivo.
 */
export async function GET(request: Request) {
  const auth = request.headers.get('authorization');
  const secret = process.env.CRON_SECRET;

  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    phase: 2,
    message: 'Ingesta 48h pendiente de conectar fuentes (TikTok, Google Trends, retail).',
    next: 'Conectar APIs y escribir en trend_live_signals',
    ran_at: new Date().toISOString(),
  });
}
