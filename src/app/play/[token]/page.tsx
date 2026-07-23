import { loadPlayerPayload } from '@/app/actions/signage';
import { SignageWebPlayer } from '@/components/portal/signage/SignageWebPlayer';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{ token: string }>;
};

export default async function PlayTokenPage({ params }: Props) {
  const { token } = await params;
  const payload = await loadPlayerPayload(token);
  if (!payload) notFound();

  return (
    <SignageWebPlayer
      device={payload.device}
      playlist={payload.playlist ?? null}
      schedule={payload.schedule ?? null}
      sponsors={payload.sponsors}
      assets={payload.assets}
      exercises={payload.exercises}
      clubName={String(payload.club.name)}
      clubLogoUrl={payload.club.logo_url ? String(payload.club.logo_url) : null}
      deviceToken={token}
    />
  );
}
