import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase";
import { verifyClubSessionFromRequest } from "@/lib/verify-club-session";
import { guardClubModuleOr403 } from "@/lib/club-matrix-api-guard";
import { isUuidLike } from "@/lib/operativa-sync";

type PlayerRow = {
  id: string;
  name: string;
  surname: string;
  number?: string;
  nickname?: string;
  email?: string;
  category?: string;
  teamSuffix?: string;
  position?: string;
  status?: string;
  attendance?: string;
  isMinor?: boolean;
  tutorName?: string;
  tutorSurname?: string;
  tutorPhone?: string;
  tutorEmail?: string;
  photoUrl?: string;
  birthDate?: string;
  joinDate?: string;
};

type PlayersPayload = {
  players: PlayerRow[];
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

function sanitizePlayerRow(input: unknown): PlayerRow | null {
  if (!input || typeof input !== "object") return null;
  const row = input as Record<string, unknown>;
  const id = typeof row.id === "string" ? row.id.trim() : "";
  const name = typeof row.name === "string" ? row.name.trim() : "";
  const surname = typeof row.surname === "string" ? row.surname.trim() : "";
  if (!id || !name) return null;
  return {
    id,
    name,
    surname,
    number: typeof row.number === "string" ? row.number : row.number != null ? String(row.number) : undefined,
    nickname: typeof row.nickname === "string" ? row.nickname : undefined,
    email: typeof row.email === "string" ? row.email : undefined,
    category: typeof row.category === "string" ? row.category : undefined,
    teamSuffix: typeof row.teamSuffix === "string" ? row.teamSuffix : undefined,
    position: typeof row.position === "string" ? row.position : undefined,
    status: typeof row.status === "string" ? row.status : undefined,
    attendance: typeof row.attendance === "string" ? row.attendance : undefined,
    isMinor: typeof row.isMinor === "boolean" ? row.isMinor : undefined,
    tutorName: typeof row.tutorName === "string" ? row.tutorName : undefined,
    tutorSurname: typeof row.tutorSurname === "string" ? row.tutorSurname : undefined,
    tutorPhone: typeof row.tutorPhone === "string" ? row.tutorPhone : undefined,
    tutorEmail: typeof row.tutorEmail === "string" ? row.tutorEmail : undefined,
    photoUrl: typeof row.photoUrl === "string" ? row.photoUrl : undefined,
    birthDate: typeof row.birthDate === "string" ? row.birthDate : undefined,
    joinDate: typeof row.joinDate === "string" ? row.joinDate : undefined,
  };
}

function normalizePlayersPayload(input: unknown): PlayersPayload {
  const players = Array.isArray((input as { players?: unknown[] } | null)?.players)
    ? ((input as { players: unknown[] }).players
        .map(sanitizePlayerRow)
        .filter((x): x is PlayerRow => x !== null))
    : [];
  return { players };
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

  const denied = await guardClubModuleOr403(gate, token, "players", "view");
  if (denied) return denied;

  const userClient = clientForUser(token);
  if (!userClient) return NextResponse.json({ error: "Supabase no configurado" }, { status: 404 });

  const { data, error } = await userClient
    .from("methodology_warehouse_state")
    .select("payload")
    .eq("club_id", gate.clubId)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const payload = normalizePlayersPayload((data?.payload ?? {}) as unknown);
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

  const denied = await guardClubModuleOr403(gate, token, "players", "edit");
  if (denied) return denied;

  let body: { payload?: unknown } = {};
  try {
    body = (await req.json()) as { payload?: unknown };
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const payload = normalizePlayersPayload(body.payload ?? {});
  const userClient = clientForUser(token);
  if (!userClient) return NextResponse.json({ error: "Supabase no configurado" }, { status: 404 });

  const { error } = await userClient
    .from("methodology_warehouse_state")
    .upsert({ club_id: gate.clubId, payload })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, payload });
}

