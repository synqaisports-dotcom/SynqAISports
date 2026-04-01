import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase";
import { verifyClubSessionFromRequest } from "@/lib/verify-club-session";
import { guardClubModuleOr403 } from "@/lib/club-matrix-api-guard";
import { isUuidLike } from "@/lib/operativa-sync";

type LiveFieldsScheduleItem = {
  facilityId: string;
  zone: string;
  start: string;
  end: string;
  teamName: string;
  coachName: string;
};

type LiveFieldsSchedulePayload = {
  items: LiveFieldsScheduleItem[];
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

function sanitizeScheduleItem(input: unknown): LiveFieldsScheduleItem | null {
  if (!input || typeof input !== "object") return null;
  const row = input as Record<string, unknown>;
  const facilityId = typeof row.facilityId === "string" ? row.facilityId.trim() : "";
  const zone = typeof row.zone === "string" ? row.zone.trim().toUpperCase() : "";
  const start = typeof row.start === "string" ? row.start.trim() : "";
  const end = typeof row.end === "string" ? row.end.trim() : "";
  const teamName = typeof row.teamName === "string" ? row.teamName.trim() : "";
  const coachName = typeof row.coachName === "string" ? row.coachName.trim() : "";
  if (!facilityId || !zone || !start || !end || !teamName) return null;
  return { facilityId, zone, start, end, teamName, coachName };
}

function normalizePayload(input: unknown): LiveFieldsSchedulePayload {
  const source = (input && typeof input === "object" ? (input as { items?: unknown[] }).items : null) ?? [];
  const items = Array.isArray(source)
    ? source.map(sanitizeScheduleItem).filter((x): x is LiveFieldsScheduleItem => x !== null)
    : [];
  return { items };
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

  const denied = await guardClubModuleOr403(gate, token, "facilities", "view");
  if (denied) return denied;

  const userClient = clientForUser(token);
  if (!userClient) return NextResponse.json({ error: "Supabase no configurado" }, { status: 503 });

  const { data, error } = await userClient
    .from("methodology_warehouse_state")
    .select("payload")
    .eq("club_id", gate.clubId)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const rootPayload = (data?.payload && typeof data.payload === "object" ? data.payload : {}) as Record<string, unknown>;
  const payload = normalizePayload(rootPayload.liveFieldsSchedule ?? {});
  return NextResponse.json({ ok: true, payload });
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

  const denied = await guardClubModuleOr403(gate, token, "facilities", "edit");
  if (denied) return denied;

  let body: { payload?: unknown } = {};
  try {
    body = (await req.json()) as { payload?: unknown };
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const payload = normalizePayload(body.payload ?? {});
  const userClient = clientForUser(token);
  if (!userClient) return NextResponse.json({ error: "Supabase no configurado" }, { status: 503 });

  const { data: current, error: readError } = await userClient
    .from("methodology_warehouse_state")
    .select("payload")
    .eq("club_id", gate.clubId)
    .maybeSingle();
  if (readError) return NextResponse.json({ error: readError.message }, { status: 500 });

  const currentPayload =
    (current?.payload && typeof current.payload === "object" ? current.payload : {}) as Record<string, unknown>;
  const mergedPayload = {
    ...currentPayload,
    liveFieldsSchedule: payload,
  };

  const { error } = await userClient
    .from("methodology_warehouse_state")
    .upsert({ club_id: gate.clubId, payload: mergedPayload })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, payload });
}
