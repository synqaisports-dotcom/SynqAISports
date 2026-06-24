import { NextResponse } from 'next/server';
import { getSupabaseEnvStatus } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/** Diagnóstico de variables Vercel (sin exponer valores secretos). */
export async function GET() {
  const env = getSupabaseEnvStatus();

  return NextResponse.json({
    ok: env.url && env.readKey && env.secretKey,
    message: env.secretKey
      ? 'Secret key detectada en el servidor'
      : 'Falta SUPABASE_SECRET_KEY en este deployment de Vercel',
    env,
    fix:
      !env.secretKey
        ? [
            'Vercel → Settings → Environment Variables',
            'Nombre exacto: SUPABASE_SECRET_KEY',
            'Valor: Secret key de Supabase (sb_secret_...)',
            'Marcar: Production (y Preview si quieres)',
            'Save → Deployments → Redeploy del último commit en main',
          ]
        : [],
  });
}
