import { DEMO_COOKIE } from '@/lib/demo';
import { NextResponse } from 'next/server';

/** Un clic → cookie demo → redirige al portal (sin login). */
export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const response = NextResponse.redirect(`${origin}/portal`);
  response.cookies.set(DEMO_COOKIE, '1', {
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  return response;
}
