import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';

export async function verifySuperadminFromRequest(req: Request): Promise<
  { ok: true; userId: string } | { ok: false; status: number; message: string }
> {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace(/^Bearer\s+/i, '')?.trim();
  if (!token) {
    return { ok: false, status: 401, message: 'Falta sesión (Authorization Bearer).' };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    return { ok: false, status: 503, message: 'Supabase no configurado en el servidor.' };
  }

  const userClient = createClient<Database>(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: userData, error: userErr } = await userClient.auth.getUser(token);
  if (userErr || !userData.user) {
    return { ok: false, status: 401, message: 'Sesión inválida.' };
  }

  const { data: prof, error: profErr } = await userClient
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .single();

  if (profErr || prof?.role !== 'superadmin') {
    return { ok: false, status: 403, message: 'Solo superadmin puede usar esta operación.' };
  }

  return { ok: true, userId: userData.user.id };
}
