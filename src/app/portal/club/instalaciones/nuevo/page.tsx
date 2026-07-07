import { redirect } from 'next/navigation';

export default function PortalClubInstalacionesNuevoRedirectPage() {
  redirect('/portal/club/instalaciones?create=1');
}
