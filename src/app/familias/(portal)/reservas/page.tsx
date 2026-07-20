import { redirect } from 'next/navigation';
import { loadClubFacilities } from '@/app/actions/club-facilities';
import { loadFamilyReservations } from '@/app/actions/facility-reservations';
import { FamilyReservationsPanel } from '@/components/familias/FamilyReservationsPanel';
import { getFamilyContext } from '@/lib/family-auth';

export default async function FamiliasReservasPage() {
  const family = await getFamilyContext();
  if (!family) redirect('/familias/login');

  const playerIds = family.players.map((player) => player.id);
  const [facilities, reservations] = await Promise.all([
    loadClubFacilities(family.club.id),
    loadFamilyReservations(family.club.id, playerIds),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Reservas</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gimnasio con confirmación inmediata · Fisioterapia con aprobación del fisio
        </p>
      </div>
      <FamilyReservationsPanel
        family={family}
        facilities={facilities}
        reservations={reservations}
      />
    </div>
  );
}
