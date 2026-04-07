import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase";
import { verifyClubSessionFromRequest } from "@/lib/verify-club-session";
import { guardClubModuleOr403 } from "@/lib/club-matrix-api-guard";
import { isUuidLike } from "@/lib/operativa-sync";

type RegistrationPayload = {
  registrationsByTournamentId?: Record<string, unknown>;
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

function normalizeContainer(input: unknown): RegistrationPayload {
  if (!input || typeof input !== "object") return { registrationsByTournamentId: {} };
  const payload = input as Record<string, unknown>;
  const byTournament =
    payload.registrationsByTournamentId && typeof payload.registrationsByTournamentId === "object"
      ? (payload.registrationsByTournamentId as Record<string, unknown>)
      : {};
  return { registrationsByTournamentId: byTournament };
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

  const payload = normalizeContainer(data?.payload);
  const registrations = payload.registrationsByTournamentId?.[tournamentId];
  return NextResponse.json({ ok: true, payload: Array.isArray(registrations) ? registrations : [] });
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
  if (!Array.isArray(body.payload)) return NextResponse.json({ error: "payload debe ser array" }, { status: 400 });

  const userClient = clientForUser(token);
  if (!userClient) return NextResponse.json({ error: "Supabase no configurado" }, { status: 503 });

  const { data: current, error: getError } = await userClient
    .from("methodology_warehouse_state")
    .select("payload")
    .eq("club_id", gate.clubId)
    .maybeSingle();
  if (getError) return NextResponse.json({ error: getError.message }, { status: 500 });

  const container = normalizeContainer(current?.payload);
  const nextPayload = {
    ...container,
    registrationsByTournamentId: {
      ...(container.registrationsByTournamentId ?? {}),
      [tournamentId]: body.payload,
    },
  };

  const { error } = await userClient
    .from("methodology_warehouse_state")
    .upsert({ club_id: gate.clubId, payload: nextPayload })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, payload: body.payload });
}

