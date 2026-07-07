import { redirect } from 'next/navigation';

type Props = {
  params: Promise<{ teamId: string }>;
  searchParams: Promise<{ edit?: string }>;
};

export default async function PortalCanteraEquipoRedirectPage({
  params,
  searchParams,
}: Props) {
  const { teamId } = await params;
  const { edit } = await searchParams;
  const query = new URLSearchParams({ team: teamId });
  if (edit === '1') query.set('edit', '1');
  redirect(`/portal/cantera/equipos?${query.toString()}`);
}
