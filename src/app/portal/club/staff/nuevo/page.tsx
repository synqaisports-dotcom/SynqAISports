import { redirect } from 'next/navigation';

export default async function PortalClubStaffNuevoRedirectPage() {
  redirect('/portal/club/staff?create=1');
}
