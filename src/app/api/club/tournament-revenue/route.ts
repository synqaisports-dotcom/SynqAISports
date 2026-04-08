import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase";
import { verifyClubSessionFromRequest } from "@/lib/verify-club-session";
import { guardClubModuleOr403 } from "@/lib/club-matrix-api-guard";
import { isUuidLike } from "@/lib/operativa-sync";

type RevenueSponsor = {
  id: string;
  name: string;
  type: "microapp" | "static";
  amount: number;
  assetDataUrl?: string;
};

type TournamentRevenueConfig = {
  ticketing: {
    enabled: boolean;
    includeMinors: boolean;
    adultPrice: number;
    minorPrice: number;
    expectedAdults: number;
    expectedMinors: number;
  };
  spaces: {
    standsEnabled: boolean;
    standsCount: number;
    standPrice: number;
    cafeteriaEnabled: boolean;
    cafeteriaPrice: number;
  };
  sponsors: RevenueSponsor[];
};

type RevenuePayload = {
  byTournament: Record<string, TournamentRevenueConfig>;
};

function clientForUser(token: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  return createClient<Database>(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

function sanitizeRevenueConfig(input: unknown): TournamentRevenueConfig | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Record<string, unknown>;
  const ticketingRaw = raw.ticketing && typeof raw.ticketing === "object" ? (raw.ticketing as Record<string, unknown>) : {};
  const spacesRaw = raw.spaces && typeof raw.spaces === "object" ? (raw.spaces as Record<string, unknown>) : {};
  const sponsorsRaw = Array.isArray(raw.sponsors) ? raw.sponsors : [];

  const sponsors: RevenueSponsor[] = sponsorsRaw
    .map((s) => {
      if (!s || typeof s !== "object") return null;
      const r = s as Record<string, unknown>;
      const id = typeof r.id === "string" ? r.id.trim() : "";
      const name = typeof r.name === "string" ? r.name.trim() : "";
      const type = r.type === "microapp" || r.type === "static" ? r.type : "microapp";
      const amount = Math.max(0, Number(r.amount ?? 0) || 0);
      if (!id || !name) return null;
      return {
        id,
        name,
        type,
        amount,
        assetDataUrl: typeof r.assetDataUrl === "string" ? r.assetDataUrl : undefined,
      } satisfies RevenueSponsor;
    })
    .filter((x): x is RevenueSponsor => x !== null);

  return {
    ticketing: {
      enabled: Boolean(ticketingRaw.enabled),
      includeMinors: Boolean(ticketingRaw.includeMinors),
      adultPrice: Math.max(0, Number(ticketingRaw.adultPrice ?? 0) || 0),
      minorPrice: Math.max(0, Number(ticketingRaw.minorPrice ?? 0) || 0),
      expectedAdults: Math.max(0, Math.floor(Number(ticketingRaw.expectedAdults ?? 0) || 0)),
      expectedMinors: Math.max(0, Math.floor(Number(ticketingRaw.expectedMinors ?? 0) || 0)),
    },
    spaces: {
      standsEnabled: Boolean(spacesRaw.standsEnabled),
      standsCount: Math.max(0, Math.floor(Number(spacesRaw.standsCount ?? 0) || 0)),
      standPrice: Math.max(0, Number(spacesRaw.standPrice ?? 0) || 0),
      cafeteriaEnabled: Boolean(spacesRaw.cafeteriaEnabled),
      cafeteriaPrice: Math.max(0, Number(spacesRaw.cafeteriaPrice ?? 0) || 0),
    },
    sponsors,
  };
}

function normalizePayload(input: unknown): RevenuePayload {
  const root = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  const byTournamentRaw = root.byTournament && typeof root.byTournament === "object"
    ? (root.byTournament as Record<string, unknown>)
    : {};
  const byTournament: Record<string, TournamentRevenueConfig> = {};
  for (const [tournamentId, value] of Object.entries(byTournamentRaw)) {
    if (!tournamentId) continue;
    const sanitized = sanitizeRevenueConfig(value);
    if (sanitized) byTournament[tournamentId] = sanitized;
  }
  return { byTournament };
}

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "").trim();
  if (!token) return NextResponse.json({ error: "Falta Authorization Bearer" }, { status: 401 });

  const gate = await verifyClubSessionFromRequest(req);
  if (!gate.ok) return NextResponse.json({ error: gate.message }, { status: gate.status });
  if (!gate.clubId || !isUuidLike(gate.clubId)) {
    return NextResponse.json({ error: "club_id inválido" }, { status: 400 });
  }

  const denied = await guardClubModuleOr403(gate, token, "club", "view");
  if (denied) return denied;

  const userClient = clientForUser(token);
  if (!userClient) return NextResponse.json({ error: "Supabase no configurado" }, { status: 503 });

  const { data, error } = await userClient
    .from("methodology_warehouse_state")
    .select("payload")
    .eq("club_id", gate.clubId)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const basePayload = (data?.payload && typeof data.payload === "object") ? (data.payload as Record<string, unknown>) : {};
  const revenuePayload = normalizePayload(basePayload.tournamentRevenue ?? {});
  return NextResponse.json({ ok: true, payload: revenuePayload });
}

export async function PUT(req: Request) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "").trim();
  if (!token) return NextResponse.json({ error: "Falta Authorization Bearer" }, { status: 401 });

  const gate = await verifyClubSessionFromRequest(req);
  if (!gate.ok) return NextResponse.json({ error: gate.message }, { status: gate.status });
  if (!gate.clubId || !isUuidLike(gate.clubId)) {
    return NextResponse.json({ error: "club_id inválido" }, { status: 400 });
  }

  const denied = await guardClubModuleOr403(gate, token, "club", "edit");
  if (denied) return denied;

  let body: { payload?: unknown } = {};
  try {
    body = (await req.json()) as { payload?: unknown };
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const incoming = normalizePayload(body.payload ?? {});
  const userClient = clientForUser(token);
  if (!userClient) return NextResponse.json({ error: "Supabase no configurado" }, { status: 503 });

  const { data: currentRow, error: currentErr } = await userClient
    .from("methodology_warehouse_state")
    .select("payload")
    .eq("club_id", gate.clubId)
    .maybeSingle();
  if (currentErr) return NextResponse.json({ error: currentErr.message }, { status: 500 });

  const basePayload = (currentRow?.payload && typeof currentRow.payload === "object")
    ? (currentRow.payload as Record<string, unknown>)
    : {};
  const prevRevenue = normalizePayload(basePayload.tournamentRevenue ?? {});

  const mergedByTournament = {
    ...prevRevenue.byTournament,
    ...incoming.byTournament,
  };
  const nextPayload = {
    ...basePayload,
    tournamentRevenue: {
      byTournament: mergedByTournament,
    },
  };

  const { error } = await userClient
    .from("methodology_warehouse_state")
    .upsert({ club_id: gate.clubId, payload: nextPayload })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, payload: { byTournament: mergedByTournament } });
}
