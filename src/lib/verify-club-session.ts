import { createClient } from '@supabase/supabase-js';
import type { Database, UserRole } from '@/lib/supabase';

export type VerifiedClubSession =
  | { ok: true; userId: string; clubId: string | null; role: UserRole | string; sandboxOnly: boolean }
  | { ok: false; status: number; message: string };

/**
 * Valida Bearer JWT y devuelve perfil mínimo. RLS del cliente respeta club_id del usuario.
 */
export async function verifyClubSessionFromRequest(req: Request): Promise<VerifiedClubSession> {
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
    .select('club_id, role, sandbox_only')
    .eq('id', userData.user.id)
    .single();

  if (profErr || !prof) {
    return { ok: false, status: 403, message: 'Perfil no encontrado.' };
  }

  const role = prof.role as UserRole | string;
  let effectiveClubId: string | null = prof.club_id;

  // Opción 1: memberships como fuente principal de ámbito club.
  const { data: membership } = await userClient
    .from("club_memberships")
    .select("club_id,status,is_default")
    .eq("user_id", userData.user.id)
    .eq("status", "active")
    .order("is_default", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (membership?.club_id) {
    effectiveClubId = membership.club_id;
  }

  return {
    ok: true,
    userId: userData.user.id,
    clubId: effectiveClubId,
    role,
    sandboxOnly: !!prof.sandbox_only,
  };
}
