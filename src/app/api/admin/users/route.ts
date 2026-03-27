import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase";
import { verifySuperadminFromRequest } from "../verify-superadmin";

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function GET(req: Request) {
  const gate = await verifySuperadminFromRequest(req);
  if (!gate.ok) {
    return NextResponse.json({ error: gate.message }, { status: gate.status });
  }
  const admin = adminClient();
  if (!admin) {
    return NextResponse.json({ error: "Supabase service role no configurada." }, { status: 503 });
  }
  const { data, error } = await admin
    .from("profiles")
    .select("id,email,name,role,country")
    .order("updated_at", { ascending: false })
    .limit(2000);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const ids = (data ?? []).map((u) => u.id);
  let stateMap = new Map<string, { status: string; last_seen: string }>();
  if (ids.length > 0) {
    const { data: states } = await admin
      .from("admin_user_states")
      .select("profile_id,status,last_seen")
      .in("profile_id", ids);
    stateMap = new Map((states ?? []).map((s) => [s.profile_id, { status: s.status, last_seen: s.last_seen }]));
  }
  const users = (data ?? []).map((u) => ({
    id: u.id,
    name: u.name ?? "",
    surname: "",
    email: u.email ?? "",
    country: u.country ?? "España",
    role: u.role ?? "coach",
    status: stateMap.get(u.id)?.status ?? "Approved",
    lastSeen: stateMap.get(u.id)?.last_seen ?? "Online",
    source: "remote",
  }));
  return NextResponse.json({ ok: true, users });
}

export async function PATCH(req: Request) {
  const gate = await verifySuperadminFromRequest(req);
  if (!gate.ok) {
    return NextResponse.json({ error: gate.message }, { status: gate.status });
  }
  const admin = adminClient();
  if (!admin) {
    return NextResponse.json({ error: "Supabase service role no configurada." }, { status: 503 });
  }
  let body: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
    country?: string;
    status?: "Pending" | "Approved" | "Denied";
    lastSeen?: string;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  if (!body?.id) return NextResponse.json({ error: "id requerido" }, { status: 400 });
  const patch: Record<string, unknown> = {};
  if (body.name !== undefined) patch.name = body.name;
  if (body.email !== undefined) patch.email = body.email;
  if (body.role !== undefined) patch.role = body.role;
  if (body.country !== undefined) patch.country = body.country;
  if (Object.keys(patch).length === 0 && body.status === undefined && body.lastSeen === undefined) {
    return NextResponse.json({ error: "Nada que actualizar" }, { status: 400 });
  }
  if (Object.keys(patch).length > 0) {
    const { error } = await admin.from("profiles").update(patch).eq("id", body.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (body.status !== undefined || body.lastSeen !== undefined) {
    const { error: stateErr } = await admin.from("admin_user_states").upsert({
      profile_id: body.id,
      status: body.status ?? "Approved",
      last_seen: body.lastSeen ?? "Online",
    });
    if (stateErr) return NextResponse.json({ error: stateErr.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
