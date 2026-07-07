import { redirect } from 'next/navigation';
import { CANTERA_CATEGORIES } from '@/lib/cantera-categories';

type Props = {
  params: Promise<{ categorySlug: string }>;
};

export default async function PortalCanteraEquipoNuevoRedirectPage({ params }: Props) {
  const { categorySlug } = await params;
  const valid = CANTERA_CATEGORIES.some((category) => category.slug === categorySlug);
  const query = new URLSearchParams({ create: '1' });
  if (valid) query.set('category', categorySlug);
  redirect(`/portal/cantera/equipos?${query.toString()}`);
}
