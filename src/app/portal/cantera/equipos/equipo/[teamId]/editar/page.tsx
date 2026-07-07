import { redirect } from 'next/navigation';

type Props = {
  params: Promise<{ teamId: string }>;
};

export default async function PortalCanteraEquipoEditarRedirectPage({ params }: Props) {
  const { teamId } = await params;
  redirect(`/portal/cantera/equipos?team=${teamId}&edit=1`);
}
