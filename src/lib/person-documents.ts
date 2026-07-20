export const PERSON_DOCUMENT_SLOTS = [
  { key: 'sexual_offenses', label: 'Certificado de delitos sexuales' },
  { key: 'medical', label: 'Certificado médico' },
  { key: 'coach_record', label: 'Ficha de entrenador' },
  { key: 'epr', label: 'Ficha de EPR' },
  {
    key: 'role_certificate',
    label: 'Certificado correspondiente (delegado, títulos oficiales, etc.)',
  },
] as const;

export type PersonDocumentSlotKey = (typeof PERSON_DOCUMENT_SLOTS)[number]['key'];

export type PersonDocumentFile = {
  url: string;
  fileName: string;
  uploadedAt: string;
};

export type PersonCustomDocument = PersonDocumentFile & {
  id: string;
  title: string;
};

export type PersonDocumentsData = {
  fixed: Partial<Record<PersonDocumentSlotKey, PersonDocumentFile>>;
  custom: PersonCustomDocument[];
};

export const EMPTY_PERSON_DOCUMENTS: PersonDocumentsData = { fixed: {}, custom: [] };

export const DEMO_PERSON_DOCS_STORAGE_KEY = 'synq-demo-person-documents-v1';

export function parsePersonDocumentsJson(value: unknown): PersonDocumentsData {
  if (!value || typeof value !== 'object') return { ...EMPTY_PERSON_DOCUMENTS };
  const raw = value as { fixed?: unknown; custom?: unknown };
  const fixed =
    raw.fixed && typeof raw.fixed === 'object' && !Array.isArray(raw.fixed)
      ? (raw.fixed as PersonDocumentsData['fixed'])
      : {};
  const custom = Array.isArray(raw.custom)
    ? raw.custom.filter(
        (item): item is PersonCustomDocument =>
          Boolean(item) &&
          typeof item === 'object' &&
          typeof (item as PersonCustomDocument).id === 'string' &&
          typeof (item as PersonCustomDocument).title === 'string' &&
          typeof (item as PersonCustomDocument).url === 'string'
      )
    : [];
  return { fixed, custom };
}

export function countPersonDocuments(data: PersonDocumentsData): number {
  return Object.keys(data.fixed).length + data.custom.length;
}

export function loadDemoPersonDocuments(personId: string): PersonDocumentsData {
  if (typeof window === 'undefined') return { ...EMPTY_PERSON_DOCUMENTS };
  try {
    const raw = localStorage.getItem(DEMO_PERSON_DOCS_STORAGE_KEY);
    if (!raw) return { ...EMPTY_PERSON_DOCUMENTS };
    const map = JSON.parse(raw) as Record<string, PersonDocumentsData>;
    return parsePersonDocumentsJson(map[personId]);
  } catch {
    return { ...EMPTY_PERSON_DOCUMENTS };
  }
}

export function saveDemoPersonDocuments(personId: string, data: PersonDocumentsData): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(DEMO_PERSON_DOCS_STORAGE_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, PersonDocumentsData>) : {};
    map[personId] = data;
    localStorage.setItem(DEMO_PERSON_DOCS_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore quota errors in demo
  }
}

export function newCustomDocumentId(): string {
  return `doc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
