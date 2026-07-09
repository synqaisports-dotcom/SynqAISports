import { redirect } from 'next/navigation';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PortalClubStaffPerfilRedirectPage({ params }: Props) {
  const { id } = await params;
  redirect(`/portal/club/staff?person=${id}`);
}
