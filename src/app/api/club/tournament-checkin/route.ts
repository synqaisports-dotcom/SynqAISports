import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase";
import { verifyClubSessionFromRequest } from "@/lib/verify-club-session";
import { guardClubModuleOr403 } from "@/lib/club-matrix-api-guard";
import { isUuidLike } from "@/lib/operativa-sync";

type TeamCheckinPayload = {
  byTeamId: Record<
    string,
    {
      present: boolean;
      checkedAt?: string;
      checkedBy?: string;
      note?: string;
      history?: Array<{
        at: string;
        action: "checkin" | "checkout";
        by: string;
        note?: string;
      }>;
    }
  >;
  updatedAt?: string;
};

type CheckinContainer = {
  byTournament: Record<string, TeamCheckinPayload>;
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

function sanitizeCheckinPayload(input: unknown): TeamCheckinPayload {
  const root = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  const rawByTeam = root.byTeamId && typeof root.byTeamId === "object" ? (root.byTeamId as Record<string, unknown>) : {};
  const byTeamId: TeamCheckinPayload["byTeamId"] = {};
  for (const [teamId, value] of Object.entries(rawByTeam)) {
    if (!teamId || !value || typeof value !== "object") continue;
    const x = value as Record<string, unknown>;
    const historyRaw = Array.isArray(x.history) ? x.history : [];
    const history: NonNullable<TeamCheckinPayload["byTeamId"][string]["history"]> = [];
    for (const e of historyRaw) {
      if (!e || typeof e !== "object") continue;
      const y = e as Record<string, unknown>;
      const action = String(y.action ?? "").trim();
      if (action !== "checkin" && action !== "checkout") continue;
      history.push({
        at: String(y.at ?? new Date().toISOString()),
        action,
        by: String(y.by ?? "terminal"),
        note: String(y.note ?? "").trim(),
      });
    }
    byTeamId[teamId] = {
      present: Boolean(x.present),
      checkedAt: typeof x.checkedAt === "string" ? x.checkedAt : undefined,
      checkedBy: typeof x.checkedBy === "string" ? x.checkedBy : undefined,
      note: typeof x.note === "string" ? x.note : undefined,
      history,
    };
  }
  return {
    byTeamId,
    updatedAt: typeof root.updatedAt === "string" ? root.updatedAt : new Date().toISOString(),
  };
}

function normalizeContainer(input: unknown): CheckinContainer {
  const root = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  const rawByTournament =
    root.byTournament && typeof root.byTournament === "object" ? (root.byTournament as Record<string, unknown>) : {};
  const byTournament: CheckinContainer["byTournament"] = {};
  for (const [tournamentId, value] of Object.entries(rawByTournament)) {
    if (!tournamentId) continue;
    byTournament[tournamentId] = sanitizeCheckinPayload(value);
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

  const denied = await guardClubModuleOr403(gate, token, "planner", "view");
  if (denied) return denied;

  const tournamentId = new URL(req.url).searchParams.get("tournamentId")?.trim();
  if (!tournamentId) return NextResponse.json({ error: "tournamentId requerido" }, { status: 400 });

  const userClient = clientForUser(token);
  if (!userClient) return NextResponse.json({ error: "Supabase no configurado" }, { status: 503 });

  const { data, error } = await userClient
    .from("methodology_warehouse_state")
    .select("payload")
    .eq("club_id", gate.clubId)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const basePayload = data?.payload && typeof data.payload === "object" ? (data.payload as Record<string, unknown>) : {};
  const container = normalizeContainer(basePayload.tournamentCheckin ?? {});
  return NextResponse.json({ ok: true, payload: container.byTournament[tournamentId] ?? { byTeamId: {} } });
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

  const denied = await guardClubModuleOr403(gate, token, "planner", "edit");
  if (denied) return denied;

  let body: { tournamentId?: string; payload?: unknown } = {};
  try {
    body = (await req.json()) as { tournamentId?: string; payload?: unknown };
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const tournamentId = String(body.tournamentId ?? "").trim();
  if (!tournamentId) return NextResponse.json({ error: "tournamentId requerido" }, { status: 400 });
  const sanitizedIncoming = sanitizeCheckinPayload(body.payload ?? {});

  const userClient = clientForUser(token);
  if (!userClient) return NextResponse.json({ error: "Supabase no configurado" }, { status: 503 });

  const { data: currentRow, error: currentErr } = await userClient
    .from("methodology_warehouse_state")
    .select("payload")
    .eq("club_id", gate.clubId)
    .maybeSingle();
  if (currentErr) return NextResponse.json({ error: currentErr.message }, { status: 500 });

  const basePayload =
    currentRow?.payload && typeof currentRow.payload === "object" ? (currentRow.payload as Record<string, unknown>) : {};
  const prevContainer = normalizeContainer(basePayload.tournamentCheckin ?? {});
  const nextTournamentPayload = {
    ...prevContainer.byTournament,
    [tournamentId]: sanitizedIncoming,
  };
  const nextPayload = {
    ...basePayload,
    tournamentCheckin: {
      byTournament: nextTournamentPayload,
    },
  };

  const { error } = await userClient
    .from("methodology_warehouse_state")
    .upsert({ club_id: gate.clubId, payload: nextPayload })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, payload: sanitizedIncoming });
}
