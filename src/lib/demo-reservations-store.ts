import { DEMO_RESERVATIONS, type FacilityReservation } from '@/lib/facility-reservations';

let demoReservations: FacilityReservation[] = [...DEMO_RESERVATIONS];

export function getDemoReservations(): FacilityReservation[] {
  return [...demoReservations];
}

export function setDemoReservations(next: FacilityReservation[]): void {
  demoReservations = [...next];
}

export function resetDemoReservations(): void {
  demoReservations = [...DEMO_RESERVATIONS];
}
