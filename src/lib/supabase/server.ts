import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { isDemoActive } from '@/lib/demo';
import { createServiceClient } from '@/lib/supabase/service';

export async function createClient() {
  if (await isDemoActive()) {
    const service = createServiceClient();
    if (service) return service;
  }

  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Supabase no configurado.');
  }

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
