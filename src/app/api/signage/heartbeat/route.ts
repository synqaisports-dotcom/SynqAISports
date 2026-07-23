import { loadPlayerPayload } from '@/app/actions/signage';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  if (!token) return NextResponse.json({ ok: false }, { status: 400 });

  const payload = await loadPlayerPayload(token);
  return NextResponse.json({ ok: Boolean(payload) });
}
