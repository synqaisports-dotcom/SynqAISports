export type FoundingLeadStatus = 'pending' | 'approved' | 'rejected';

export type FoundingLead = {
  id: string;
  club_name: string;
  contact_name: string;
  contact_email: string;
  country_code: string;
  players_count: number;
  sites_count: number;
  message: string | null;
  status: FoundingLeadStatus;
  created_at: string;
  invite_code: string | null;
  club_slug: string | null;
  founding_until: string | null;
};

const SEED: FoundingLead[] = [
  {
    id: 'demo-lead-norte',
    club_name: 'Atlético Base Norte',
    contact_name: 'Laura Gómez',
    contact_email: 'laura@atleticobase.test',
    country_code: 'ES',
    players_count: 140,
    sites_count: 2,
    message: 'Queremos entrar en el programa founding de Madrid.',
    status: 'pending',
    created_at: '2026-10-02T09:30:00.000Z',
    invite_code: null,
    club_slug: null,
    founding_until: null,
  },
  {
    id: 'demo-lead-ribera',
    club_name: 'CF Ribera',
    contact_name: 'Marc Puig',
    contact_email: 'marc@cfribera.test',
    country_code: 'ES',
    players_count: 90,
    sites_count: 1,
    message: null,
    status: 'pending',
    created_at: '2026-10-18T16:10:00.000Z',
    invite_code: null,
    club_slug: null,
    founding_until: null,
  },
];

let leads: FoundingLead[] = SEED.map((lead) => ({ ...lead }));

export function listDemoFoundingLeads(): FoundingLead[] {
  return leads
    .map((lead) => ({ ...lead }))
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function getDemoFoundingLead(id: string): FoundingLead | undefined {
  const lead = leads.find((item) => item.id === id);
  return lead ? { ...lead } : undefined;
}

export function addDemoFoundingLead(lead: FoundingLead): FoundingLead {
  leads = [lead, ...leads.filter((item) => item.id !== lead.id)];
  return { ...lead };
}

export function updateDemoFoundingLead(
  id: string,
  patch: Partial<FoundingLead>
): FoundingLead | undefined {
  const index = leads.findIndex((item) => item.id === id);
  if (index < 0) return undefined;
  leads[index] = { ...leads[index], ...patch, id };
  return { ...leads[index] };
}
