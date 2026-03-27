import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase";
import { verifySuperadminFromRequest } from "../verify-superadmin";
import { isUuidLike } from "@/lib/operativa-sync";

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
  const url = new URL(req.url);
  const clubId = url.searchParams.get("clubId")?.trim();
  if (!clubId || !isUuidLike(clubId)) {
    return NextResponse.json({ error: "clubId uuid requerido" }, { status: 400 });
  }
  const admin = adminClient();
  if (!admin) {
    return NextResponse.json({ error: "Supabase service role no configurada." }, { status: 503 });
  }
  const { data, error } = await admin
    .from("club_staff_access_matrices")
    .select("payload")
    .eq("club_id", clubId)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const payload = data?.payload ?? {};
  return NextResponse.json({ ok: true, payload });
}

export async function PUT(req: Request) {
  const gate = await verifySuperadminFromRequest(req);
  if (!gate.ok) {
    return NextResponse.json({ error: gate.message }, { status: gate.status });
  }
  let body: { clubId?: string; payload?: unknown };
  try {
    body = (await req.json()) as { clubId?: string; payload?: unknown };
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const clubId = body.clubId?.trim();
  if (!clubId || !isUuidLike(clubId)) {
    return NextResponse.json({ error: "clubId uuid requerido" }, { status: 400 });
  }
  if (body.payload === undefined) {
    return NextResponse.json({ error: "payload requerido" }, { status: 400 });
  }
  const admin = adminClient();
  if (!admin) {
    return NextResponse.json({ error: "Supabase service role no configurada." }, { status: 503 });
  }
  const { error } = await admin
    .from("club_staff_access_matrices")
    .upsert({ club_id: clubId, payload: body.payload })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
