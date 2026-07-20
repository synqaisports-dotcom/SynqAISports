import { createClient } from '@/lib/supabase/server';
import { activateFamilyAccountForUser } from '@/lib/family-auth';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/portal';

  if (code) {
    const supabase = await createClient();
    const { data } = await supabase.auth.exchangeCodeForSession(code);
    if (data.user?.id && data.user.email) {
      await activateFamilyAccountForUser(data.user.id, data.user.email);
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
