import { redirect } from 'next/navigation';

export default function PortalClubMaterialNuevoRedirectPage() {
  redirect('/portal/club/material?create=1');
}
