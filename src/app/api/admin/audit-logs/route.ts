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
    .from("admin_audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, logs: data ?? [] });
}

export async function POST(req: Request) {
  const gate = await verifySuperadminFromRequest(req);
  if (!gate.ok) {
    return NextResponse.json({ error: gate.message }, { status: gate.status });
  }
  const admin = adminClient();
  if (!admin) {
    return NextResponse.json({ error: "Supabase service role no configurada." }, { status: 503 });
  }
  let body: { title?: string; description?: string; type?: "Success" | "Info" | "Warning"; actorEmail?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  if (!body?.title?.trim() || !body?.description?.trim()) {
    return NextResponse.json({ error: "title y description requeridos" }, { status: 400 });
  }
  const { error } = await admin.from("admin_audit_logs").insert({
    actor_id: gate.userId,
    actor_email: body.actorEmail ?? null,
    title: body.title.trim(),
    description: body.description.trim(),
    type: body.type ?? "Info",
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
