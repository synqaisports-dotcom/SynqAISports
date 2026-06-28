import { DEMO_COOKIE } from '@/lib/demo-constants';
import { NextResponse } from 'next/server';

/** Un clic → cookie demo → redirige al portal (sin login). */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const next = url.searchParams.get('next') || '/portal';
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/portal';

  const response = NextResponse.redirect(`${origin}${safeNext}`);
  response.cookies.set(DEMO_COOKIE, '1', {
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
    sameSite: 'lax',
    secure: url.protocol === 'https:',
  });
  return response;
}
