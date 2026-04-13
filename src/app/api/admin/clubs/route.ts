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
  const { data, error } = await admin.from("clubs").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, clubs: data ?? [] });
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
  let body: { name?: string; plan?: string; country?: string; status?: string; users?: number };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  if (!body?.name?.trim()) return NextResponse.json({ error: "name requerido" }, { status: 400 });
  const { data, error } = await admin
    .from("clubs")
    .insert({
      name: body.name.trim(),
      plan: body.plan ?? "Pro",
      country: body.country ?? "ES",
      status: body.status ?? "Active",
      users: typeof body.users === "number" ? body.users : 0,
    })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, club: data });
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
  let body: { id?: string; name?: string; plan?: string; country?: string; status?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  if (!body?.id) return NextResponse.json({ error: "id requerido" }, { status: 400 });
  const patch: Record<string, unknown> = {};
  if (body.name !== undefined) patch.name = body.name;
  if (body.plan !== undefined) patch.plan = body.plan;
  if (body.country !== undefined) patch.country = body.country;
  if (body.status !== undefined) patch.status = body.status;
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nada que actualizar" }, { status: 400 });
  }
  const { error } = await admin.from("clubs").update(patch).eq("id", body.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const gate = await verifySuperadminFromRequest(req);
  if (!gate.ok) {
    return NextResponse.json({ error: gate.message }, { status: gate.status });
  }
  const admin = adminClient();
  if (!admin) {
    return NextResponse.json({ error: "Supabase service role no configurada." }, { status: 503 });
  }
  let body: { id?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  if (!body?.id?.trim()) return NextResponse.json({ error: "id requerido" }, { status: 400 });

  const { error } = await admin.from("clubs").delete().eq("id", body.id.trim());
  if (error) {
    return NextResponse.json(
      { error: error.message, hint: "Puede haber datos vinculados (perfiles, membresías). Revisa FK en Supabase." },
      { status: 409 },
    );
  }
  return NextResponse.json({ ok: true });
}
