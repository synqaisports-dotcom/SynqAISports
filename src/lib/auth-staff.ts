import { getDemoClubId, isDemoMode } from '@/lib/demo';
import { createClient } from '@/lib/supabase/server';

export async function requireClubId(): Promise<string | null> {
  if (isDemoMode()) return getDemoClubId();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: staff } = await supabase
    .from('synq_staff')
    .select('club_id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();

  return staff?.club_id ?? null;
}

export async function requireUserId(): Promise<string | null> {
  if (isDemoMode()) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}
