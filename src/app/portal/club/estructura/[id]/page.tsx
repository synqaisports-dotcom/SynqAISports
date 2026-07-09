import { redirect } from 'next/navigation';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PortalClubEstructuraPerfilRedirectPage({ params }: Props) {
  const { id } = await params;
  redirect(`/portal/club/estructura?person=${id}`);
}
