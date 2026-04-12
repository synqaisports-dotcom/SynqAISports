import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase";
import { verifyClubSessionFromRequest } from "@/lib/verify-club-session";

function userClient(token: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  return createClient<Database>(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

type Body = {
  syncKey?: string;
  teamId?: string;
  mcc?: string;
  session?: string;
  incidentId?: string;
  incidentLabel?: string;
  score?: { home?: number; guest?: number };
  remainingSec?: number;
  source?: string;
};

function isDuplicateError(msg: string) {
  return /duplicate|unique|23505/i.test(msg);
}

/**
 * Promoción autenticada: incidencia de continuidad → operativa_mobile_incidents.
 * club_id siempre desde sesión (gate), no desde el body.
 * Idempotencia: columna sync_key única (migración 20260412140000).
 */
export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "")?.trim();
  if (!token) {
    return NextResponse.json({ ok: false, error: "missing_bearer" }, { status: 401 });
  }

  const gate = await verifyClubSessionFromRequest(req);
  if (!gate.ok) {
    return NextResponse.json({ ok: false, error: gate.message }, { status: gate.status });
  }
  if (!gate.clubId) {
    return NextResponse.json({ ok: false, error: "no_club" }, { status: 400 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const syncKey = String(body.syncKey ?? "").trim();
  if (!syncKey || syncKey.length > 512) {
    return NextResponse.json({ ok: false, error: "sync_key_required" }, { status: 400 });
  }
  if (
    !body.teamId ||
    !body.mcc ||
    !body.session ||
    !body.incidentId ||
    !body.incidentLabel
  ) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }

  const row = {
    club_id: gate.clubId,
    actor_id: gate.userId,
    team_id: String(body.teamId),
    mcc: String(body.mcc),
    session: String(body.session),
    incident_id: String(body.incidentId),
    incident_label: String(body.incidentLabel),
    score_home: Math.max(0, Number(body.score?.home ?? 0)),
    score_guest: Math.max(0, Number(body.score?.guest ?? 0)),
    remaining_sec: Math.max(0, Number(body.remainingSec ?? 0)),
    source: String(body.source ?? "mobile_continuity"),
    sync_key: syncKey,
  };

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (serviceKey && url) {
    const admin = createClient<Database>(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const existing = await admin
      .from("operativa_mobile_incidents")
      .select("id")
      .eq("sync_key", syncKey)
      .eq("club_id", gate.clubId)
      .maybeSingle();
    if (existing.data?.id) {
      return NextResponse.json({ ok: true, duplicate: true });
    }
    const ins = await admin.from("operativa_mobile_incidents").insert(row);
    if (ins.error) {
      if (isDuplicateError(ins.error.message)) {
        return NextResponse.json({ ok: true, duplicate: true });
      }
      return NextResponse.json({ ok: false, error: ins.error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, inserted: true });
  }

  const client = userClient(token);
  if (!client) {
    return NextResponse.json({ ok: false, error: "supabase_not_configured" }, { status: 503 });
  }

  const ins = await client.from("operativa_mobile_incidents").insert(row);
  if (ins.error) {
    if (isDuplicateError(ins.error.message)) {
      return NextResponse.json({ ok: true, duplicate: true });
    }
    return NextResponse.json({ ok: false, error: ins.error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, inserted: true });
}
