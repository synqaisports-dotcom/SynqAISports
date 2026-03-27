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
  if (!gate.ok) return NextResponse.json({ error: gate.message }, { status: gate.status });
  const admin = adminClient();
  if (!admin) return NextResponse.json({ error: "Supabase service role no configurada." }, { status: 503 });
  const { data, error } = await admin.from("global_plans").select("*").order("updated_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, plans: data ?? [] });
}

export async function POST(req: Request) {
  const gate = await verifySuperadminFromRequest(req);
  if (!gate.ok) return NextResponse.json({ error: gate.message }, { status: gate.status });
  const admin = adminClient();
  if (!admin) return NextResponse.json({ error: "Supabase service role no configurada." }, { status: 503 });
  let body: {
    id?: string;
    title?: string;
    pricePerNode?: string;
    minNodes?: string;
    features?: unknown[];
    access?: unknown[];
    defaultRole?: string;
    isActive?: boolean;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  if (!body?.id || !body?.title?.trim()) {
    return NextResponse.json({ error: "id y title requeridos" }, { status: 400 });
  }
  const { error } = await admin.from("global_plans").upsert({
    id: body.id,
    title: body.title.trim(),
    price_per_node: body.pricePerNode ?? null,
    min_nodes: body.minNodes ?? null,
    features: Array.isArray(body.features) ? body.features : [],
    access: Array.isArray(body.access) ? body.access : [],
    default_role: body.defaultRole ?? "club_admin",
    is_active: body.isActive ?? true,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request) {
  const gate = await verifySuperadminFromRequest(req);
  if (!gate.ok) return NextResponse.json({ error: gate.message }, { status: gate.status });
  const admin = adminClient();
  if (!admin) return NextResponse.json({ error: "Supabase service role no configurada." }, { status: 503 });
  let body: { id?: string; isActive?: boolean };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  if (!body?.id || typeof body.isActive !== "boolean") {
    return NextResponse.json({ error: "id e isActive requeridos" }, { status: 400 });
  }
  const { error } = await admin.from("global_plans").update({ is_active: body.isActive }).eq("id", body.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
