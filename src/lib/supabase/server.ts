import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { isDemoActive } from '@/lib/demo';
import { createServiceClient } from '@/lib/supabase/service';
import { isSupabaseConfigured } from '@/lib/supabase/config';

function createAnonServerClient(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server Component — ignore if cookies are read-only
        }
      },
    },
  });
}

/** Cliente mínimo para demo sin variables Supabase (solo contexto estático). */
function createDemoFallbackClient(): SupabaseClient {
  return createSupabaseClient('https://demo.synqai.local', 'demo-static', {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function createClient() {
  if (await isDemoActive()) {
    const service = createServiceClient();
    if (service) return service;

    if (isSupabaseConfigured()) {
      const cookieStore = await cookies();
      return createAnonServerClient(cookieStore);
    }

    return createDemoFallbackClient();
  }

  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Supabase no configurado.');
  }

  return createAnonServerClient(cookieStore);
}
