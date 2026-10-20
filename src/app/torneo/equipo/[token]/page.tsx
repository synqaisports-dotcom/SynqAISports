import { loadTeamByInviteToken } from '@/app/actions/tournaments';
import { DelegatePortal } from '@/components/torneo/DelegatePortal';
import { notFound } from 'next/navigation';

type Props = { params: Promise<{ token: string }> };

export default async function DelegatePage({ params }: Props) {
  const { token } = await params;
  const data = await loadTeamByInviteToken(token);
  if (!data) notFound();
  return <DelegatePortal team={data.team} bundle={data.bundle} />;
}

export const metadata = {
  title: 'Portal delegado · SynqAI Torneos',
};
