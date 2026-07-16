import 'server-only';

import { getStaffRole } from '@/lib/auth-staff';
import { canEditMethodology } from '@/lib/methodology-access';

export async function assertCanEditMethodology(): Promise<
  { ok: true; role: string } | { ok: false; message: string }
> {
  const role = await getStaffRole();
  if (!role || !canEditMethodology(role)) {
    return { ok: false, message: 'forbidden' };
  }
  return { ok: true, role };
}
