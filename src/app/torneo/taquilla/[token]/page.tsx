import { GateScanner } from '@/components/torneo/GateScanner';

type Props = { params: Promise<{ token: string }> };

export default async function GatePage({ params }: Props) {
  const { token } = await params;
  return <GateScanner gateToken={token} />;
}

export const metadata = {
  title: 'Taquilla · SynqAI Torneos',
};
