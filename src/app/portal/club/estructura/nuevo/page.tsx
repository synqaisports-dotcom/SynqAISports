import { redirect } from 'next/navigation';

export default function PortalClubEstructuraNuevoRedirectPage() {
  redirect('/portal/club/estructura?create=1');
}
