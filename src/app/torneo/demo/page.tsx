import { getDemoTorneoPwaLinks } from '@/app/actions/tournaments';
import { TorneoPwaHub } from '@/components/torneo/TorneoPwaHub';
import { notFound } from 'next/navigation';

export default async function TorneoDemoHubPage() {
  const links = await getDemoTorneoPwaLinks();
  if (!links) notFound();
  return <TorneoPwaHub links={links} />;
}

export const metadata = {
  title: 'Hub demo · Torneos PWA',
};
