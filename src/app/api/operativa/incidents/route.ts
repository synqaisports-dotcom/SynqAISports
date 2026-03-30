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

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "")?.trim();
  if (!token) return NextResponse.json({ error: "Falta Authorization Bearer" }, { status: 401 });

  const gate = await verifyClubSessionFromRequest(req);
  if (!gate.ok) return NextResponse.json({ error: gate.message }, { status: gate.status });
  if (!gate.clubId) return NextResponse.json({ error: "Perfil sin club asignado." }, { status: 400 });

  const client = userClient(token);
  if (!client) return NextResponse.json({ error: "Supabase no configurado" }, { status: 503 });

  const { searchParams } = new URL(req.url);
  const teamId = searchParams.get("teamId");
  const mcc = searchParams.get("mcc");
  const session = searchParams.get("session");
  const limitRaw = Number(searchParams.get("limit") ?? 30);
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 100) : 30;

  let query = client
    .from("operativa_mobile_incidents")
    .select("id, team_id, mcc, session, incident_id, incident_label, score_home, score_guest, remaining_sec, source, created_at")
    .eq("club_id", gate.clubId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (teamId) query = query.eq("team_id", teamId);
  if (mcc) query = query.eq("mcc", mcc);
  if (session) query = query.eq("session", session);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ incidents: data ?? [] });
}

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "")?.trim();
  if (!token) return NextResponse.json({ error: "Falta Authorization Bearer" }, { status: 401 });

  const gate = await verifyClubSessionFromRequest(req);
  if (!gate.ok) return NextResponse.json({ error: gate.message }, { status: gate.status });
  if (!gate.clubId) return NextResponse.json({ error: "Perfil sin club asignado." }, { status: 400 });

  let body: {
    teamId?: string;
    mcc?: string;
    session?: string;
    incidentId?: string;
    incidentLabel?: string;
    score?: { home?: number; guest?: number };
    remainingSec?: number;
    source?: string;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!body?.teamId || !body?.mcc || !body?.session || !body?.incidentId || !body?.incidentLabel) {
    return NextResponse.json({ error: "teamId, mcc, session, incidentId e incidentLabel requeridos" }, { status: 400 });
  }

  const client = userClient(token);
  if (!client) return NextResponse.json({ error: "Supabase no configurado" }, { status: 503 });

  const { error } = await client.from("operativa_mobile_incidents").insert({
    club_id: gate.clubId,
    actor_id: gate.userId,
    team_id: body.teamId,
    mcc: body.mcc,
    session: body.session,
    incident_id: body.incidentId,
    incident_label: body.incidentLabel,
    score_home: Math.max(0, Number(body.score?.home ?? 0)),
    score_guest: Math.max(0, Number(body.score?.guest ?? 0)),
    remaining_sec: Math.max(0, Number(body.remainingSec ?? 0)),
    source: body.source ?? "mobile_continuity",
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
