import { redirect } from 'next/navigation';

export default function PortalClubOrganigramaEditarRedirectPage() {
  redirect('/portal/club/organigrama?edit=1');
}
