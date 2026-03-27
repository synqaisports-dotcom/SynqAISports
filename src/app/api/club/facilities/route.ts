import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase";
import { verifyClubSessionFromRequest } from "@/lib/verify-club-session";
import { guardClubModuleOr403 } from "@/lib/club-matrix-api-guard";
import { isUuidLike } from "@/lib/operativa-sync";

type FacilityRow = {
  id: string;
  name: string;
  type: string;
  sport: string;
  status: string;
  capacity: string;
  nextMaintenance: string;
  subdivisions?: string;
  divisionStartTime?: string;
  divisionEndTime?: string;
  startTime?: string;
  endTime?: string;
  days?: string[];
};

type FacilitiesPayload = {
  facilities: FacilityRow[];
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

function sanitizeFacility(input: unknown): FacilityRow | null {
  if (!input || typeof input !== "object") return null;
  const row = input as Record<string, unknown>;
  const id = typeof row.id === "string" ? row.id.trim() : "";
  const name = typeof row.name === "string" ? row.name.trim() : "";
  if (!id || !name) return null;
  const days = Array.isArray(row.days) ? row.days.filter((d): d is string => typeof d === "string") : undefined;
  return {
    id,
    name,
    type: typeof row.type === "string" ? row.type : "Campo Exterior",
    sport: typeof row.sport === "string" ? row.sport : "Fútbol",
    status: typeof row.status === "string" ? row.status : "Active",
    capacity: typeof row.capacity === "string" ? row.capacity : "",
    nextMaintenance: typeof row.nextMaintenance === "string" ? row.nextMaintenance : "Próximamente",
    subdivisions: typeof row.subdivisions === "string" ? row.subdivisions : "1",
    divisionStartTime: typeof row.divisionStartTime === "string" ? row.divisionStartTime : undefined,
    divisionEndTime: typeof row.divisionEndTime === "string" ? row.divisionEndTime : undefined,
    startTime: typeof row.startTime === "string" ? row.startTime : undefined,
    endTime: typeof row.endTime === "string" ? row.endTime : undefined,
    days,
  };
}

function normalizeFacilitiesPayload(input: unknown): FacilitiesPayload {
  const facilities = Array.isArray((input as { facilities?: unknown[] } | null)?.facilities)
    ? ((input as { facilities: unknown[] }).facilities
        .map(sanitizeFacility)
        .filter((x): x is FacilityRow => x !== null))
    : [];
  return { facilities };
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
  const payload = normalizeFacilitiesPayload((data?.payload ?? {}) as unknown);
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

  const payload = normalizeFacilitiesPayload(body.payload ?? {});
  const userClient = clientForUser(token);
  if (!userClient) return NextResponse.json({ error: "Supabase no configurado" }, { status: 503 });

  const { error } = await userClient
    .from("methodology_warehouse_state")
    .upsert({ club_id: gate.clubId, payload })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, payload });
}
