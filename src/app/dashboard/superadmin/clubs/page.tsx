import { redirect } from "next/navigation";

/** Deprecado: usar Admin Global → Gestión Clubes. */
export default function SuperadminClubsRedirectPage() {
  redirect("/admin-global/clubs");
}
