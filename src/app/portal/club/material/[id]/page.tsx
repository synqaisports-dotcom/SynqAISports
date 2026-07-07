import { redirect } from 'next/navigation';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PortalClubMaterialRedirectPage({ params }: Props) {
  const { id } = await params;
  redirect(`/portal/club/material?material=${id}`);
}
