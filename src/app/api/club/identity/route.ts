import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase";
import { verifyClubSessionFromRequest } from "@/lib/verify-club-session";
import { guardClubModuleOr403 } from "@/lib/club-matrix-api-guard";
import { isUuidLike } from "@/lib/operativa-sync";

function clientForUser(token: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  return createClient<Database>(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

type IdentityPayload = {
  clubName: string;
  country: string;
  sport: string;
  members?: string;
  logoUrl?: string;
};

function sanitizeText(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
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

  const [{ data: prof, error: profErr }, { data: club, error: clubErr }] = await Promise.all([
    userClient
      .from("profiles")
      .select("club_name,country,sport")
      .eq("id", gate.userId)
      .single(),
    userClient
      .from("clubs")
      .select("name,country,sport,users,logo_url")
      .eq("id", gate.clubId)
      .maybeSingle(),
  ]);

  if (profErr) return NextResponse.json({ error: profErr.message }, { status: 500 });
  if (clubErr) return NextResponse.json({ error: clubErr.message }, { status: 500 });

  const payload: IdentityPayload = {
    clubName: sanitizeText(club?.name) || sanitizeText(prof?.club_name) || "NODO DE CANTERA",
    country: sanitizeText(club?.country) || sanitizeText(prof?.country) || "España",
    sport: sanitizeText(club?.sport) || sanitizeText(prof?.sport) || "Fútbol",
    members: typeof club?.users === "number" ? String(club.users) : undefined,
    logoUrl: sanitizeText(club?.logo_url),
  };

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

  const denied = await guardClubModuleOr403(gate, token, "club", "edit");
  if (denied) return denied;

  let body: Partial<IdentityPayload> = {};
  try {
    body = (await req.json()) as Partial<IdentityPayload>;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const clubName = sanitizeText(body.clubName);
  const country = sanitizeText(body.country);
  const sport = sanitizeText(body.sport);
  const membersRaw = sanitizeText(body.members);
  const members = membersRaw ? Number(membersRaw) : null;
  const logoUrl = sanitizeText(body.logoUrl);

  if (!clubName) return NextResponse.json({ error: "clubName requerido" }, { status: 400 });
  if (!country) return NextResponse.json({ error: "country requerido" }, { status: 400 });
  if (!sport) return NextResponse.json({ error: "sport requerido" }, { status: 400 });
  if (membersRaw && (!Number.isFinite(members) || members! < 0)) {
    return NextResponse.json({ error: "members inválido" }, { status: 400 });
  }

  const userClient = clientForUser(token);
  if (!userClient) return NextResponse.json({ error: "Supabase no configurado" }, { status: 503 });

  const { error: profileUpdateError } = await userClient
    .from("profiles")
    .update({
      club_name: clubName,
      country,
      sport,
    })
    .eq("id", gate.userId);

  if (profileUpdateError) {
    return NextResponse.json({ error: profileUpdateError.message }, { status: 500 });
  }

  const clubPatch: { name: string; country: string; sport: string; users?: number; logo_url?: string } = {
    name: clubName,
    country,
    sport,
  };
  if (members !== null) clubPatch.users = members;
  if (logoUrl) clubPatch.logo_url = logoUrl;

  const { error: clubUpdateError } = await userClient
    .from("clubs")
    .update(clubPatch)
    .eq("id", gate.clubId);

  if (clubUpdateError) {
    return NextResponse.json({ error: clubUpdateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
