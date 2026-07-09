import { redirect } from 'next/navigation';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PortalClubStaffEditarRedirectPage({ params }: Props) {
  const { id } = await params;
  redirect(`/portal/club/staff?person=${id}&edit=1`);
}
