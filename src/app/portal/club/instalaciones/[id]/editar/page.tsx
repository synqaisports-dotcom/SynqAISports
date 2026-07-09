import { redirect } from 'next/navigation';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PortalClubInstalacionEditarRedirectPage({ params }: Props) {
  const { id } = await params;
  redirect(`/portal/club/instalaciones?facility=${id}&edit=1`);
}
