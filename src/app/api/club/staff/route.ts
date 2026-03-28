import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase";
import { verifyClubSessionFromRequest } from "@/lib/verify-club-session";
import { guardClubModuleOr403 } from "@/lib/club-matrix-api-guard";
import { isUuidLike } from "@/lib/operativa-sync";

type StaffRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  status: string;
  photoUrl?: string;
};

type StaffPayload = {
  staff: StaffRow[];
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

function sanitizeStaffRow(input: unknown): StaffRow | null {
  if (!input || typeof input !== "object") return null;
  const row = input as Record<string, unknown>;
  const id = typeof row.id === "string" ? row.id.trim() : "";
  const name = typeof row.name === "string" ? row.name.trim() : "";
  const email = typeof row.email === "string" ? row.email.trim() : "";
  const role = typeof row.role === "string" ? row.role.trim() : "";
  if (!id || !name || !email || !role) return null;
  return {
    id,
    name,
    email,
    role,
    phone: typeof row.phone === "string" ? row.phone : "",
    status: typeof row.status === "string" ? row.status : "Active",
    photoUrl: typeof row.photoUrl === "string" ? row.photoUrl : "",
  };
}

function normalizeStaffPayload(input: unknown): StaffPayload {
  const staff = Array.isArray((input as { staff?: unknown[] } | null)?.staff)
    ? ((input as { staff: unknown[] }).staff
        .map(sanitizeStaffRow)
        .filter((x): x is StaffRow => x !== null))
    : [];
  return { staff };
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

  const denied = await guardClubModuleOr403(gate, token, "staff", "view");
  if (denied) return denied;

  const userClient = clientForUser(token);
  if (!userClient) return NextResponse.json({ error: "Supabase no configurado" }, { status: 404 });

  const { data, error } = await userClient
    .from("methodology_warehouse_state")
    .select("payload")
    .eq("club_id", gate.clubId)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const payload = normalizeStaffPayload((data?.payload ?? {}) as unknown);
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

  const denied = await guardClubModuleOr403(gate, token, "staff", "edit");
  if (denied) return denied;

  let body: { payload?: unknown } = {};
  try {
    body = (await req.json()) as { payload?: unknown };
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const payload = normalizeStaffPayload(body.payload ?? {});
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
