import type { MethodologyLibraryEntryInput } from '@/lib/methodology-library-db';

const headers = (accessToken: string) => ({
  Authorization: `Bearer ${accessToken}`,
  'Content-Type': 'application/json',
});

export function isAllowedExerciseVideoUrl(raw: string | null | undefined): boolean {
  const url = String(raw ?? "").trim();
  if (!url) return true; // opcional
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./i, "").toLowerCase();
    if (host === "youtu.be") return true;
    if (host === "youtube.com" || host.endsWith(".youtube.com")) return true;
    if (host === "vimeo.com" || host.endsWith(".vimeo.com")) return true;
    return false;
  } catch {
    return false;
  }
}

export async function fetchMethodologyLibraryTasks(accessToken: string, status?: 'Draft' | 'Official') {
  const q = status ? `?status=${encodeURIComponent(status)}` : '';
  const res = await fetch(`/api/club/methodology-library${q}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(typeof json.error === 'string' ? json.error : res.statusText);
  return json as { ok: true; tasks: unknown[] };
}

export async function createMethodologyLibraryTask(
  accessToken: string,
  body: MethodologyLibraryEntryInput,
) {
  if (!isAllowedExerciseVideoUrl((body as any)?.videoUrl)) {
    throw new Error("videoUrl inválida (solo YouTube/Vimeo)");
  }
  const res = await fetch('/api/club/methodology-library', {
    method: 'POST',
    headers: headers(accessToken),
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(typeof json.error === 'string' ? json.error : res.statusText);
  return json as { ok: true; task: unknown };
}

export async function patchMethodologyLibraryTask(
  accessToken: string,
  id: string,
  body: Partial<MethodologyLibraryEntryInput>,
) {
  if (!isAllowedExerciseVideoUrl((body as any)?.videoUrl)) {
    throw new Error("videoUrl inválida (solo YouTube/Vimeo)");
  }
  const res = await fetch(`/api/club/methodology-library/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: headers(accessToken),
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(typeof json.error === 'string' ? json.error : res.statusText);
  return json as { ok: true; task: unknown };
}

export async function deleteMethodologyLibraryTask(accessToken: string, id: string) {
  const res = await fetch(`/api/club/methodology-library/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(typeof json.error === 'string' ? json.error : res.statusText);
  return json as { ok: true };
}
