import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase";
import { verifySuperadminFromRequest } from "../verify-superadmin";
import { ROLE_CATALOG } from "@/lib/role-catalog";

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function isValidRoleKey(
  admin: ReturnType<typeof adminClient>,
  role: string,
): Promise<boolean> {
  if (!admin) return false;
  const normalized = role.trim().toLowerCase();
  if (!normalized) return false;
  const systemRoleSet = new Set(ROLE_CATALOG.map((r) => r.id));
  if (systemRoleSet.has(normalized as (typeof ROLE_CATALOG)[number]["id"])) {
    return true;
  }
  const { data, error } = await admin
    .from("synq_roles")
    .select("key")
    .eq("key", normalized)
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error("[SynqAI][admin-users][role-validate] error:", error);
    return false;
  }
  return !!data?.key;
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
    .select("id,email,name,role,country,club_id")
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
    clubId: u.club_id ?? null,
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
    sandboxOnly?: boolean;
    clubId?: string | null;
    status?: "Pending" | "Approved" | "Denied";
    lastSeen?: string;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  if (!body?.id) return NextResponse.json({ error: "id requerido" }, { status: 400 });
  if (body.role !== undefined) {
    const roleOk = await isValidRoleKey(admin, body.role);
    if (!roleOk) {
      return NextResponse.json({ error: "rol_invalido" }, { status: 400 });
    }
  }
  const effectiveRole = String(body.role ?? "").trim();
  const needsClub = effectiveRole.length > 0 && effectiveRole !== "superadmin";
  if (body.role !== undefined && needsClub && !body.clubId) {
    return NextResponse.json({ error: "club_id_requerido_para_rol" }, { status: 400 });
  }
  const patch: Record<string, unknown> = {};
  if (body.sandboxOnly !== undefined) patch.sandbox_only = !!body.sandboxOnly;
  if (body.name !== undefined) patch.name = body.name;
  if (body.email !== undefined) patch.email = body.email;
  if (body.role !== undefined) patch.role = body.role;
  if (body.country !== undefined) patch.country = body.country;
  if (body.clubId !== undefined) patch.club_id = body.clubId;
  if (Object.keys(patch).length === 0 && body.status === undefined && body.lastSeen === undefined) {
    return NextResponse.json({ error: "Nada que actualizar" }, { status: 400 });
  }
  if (Object.keys(patch).length > 0) {
    const { error } = await admin.from("profiles").update(patch).eq("id", body.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (body.role !== undefined || body.clubId !== undefined || body.sandboxOnly !== undefined) {
    const membershipRows: Array<{
      user_id: string;
      club_id: string;
      role_in_club: string;
      status: "active" | "pending" | "blocked";
      is_default: boolean;
      sandbox_scope: boolean;
    }> = [];
    if (body.clubId && (body.role ?? "").trim() && (body.role ?? "").trim() !== "superadmin") {
      membershipRows.push({
        user_id: body.id,
        club_id: body.clubId,
        role_in_club: String(body.role).trim(),
        status: "active",
        is_default: true,
        sandbox_scope: !!body.sandboxOnly,
      });
    }
    if (membershipRows.length > 0) {
      const { error: membershipErr } = await admin.from("club_memberships").upsert(membershipRows, {
        onConflict: "user_id,club_id",
      });
      if (membershipErr) return NextResponse.json({ error: membershipErr.message }, { status: 500 });
      await admin
        .from("club_memberships")
        .update({ is_default: false })
        .eq("user_id", body.id)
        .neq("club_id", body.clubId ?? "");
    }
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

export async function POST(req: Request) {
  const gate = await verifySuperadminFromRequest(req);
  if (!gate.ok) {
    return NextResponse.json({ error: gate.message }, { status: gate.status });
  }
  const admin = adminClient();
  if (!admin) {
    return NextResponse.json({ error: "Supabase service role no configurada." }, { status: 503 });
  }

  let body: {
    name?: string;
    surname?: string;
    email?: string;
    country?: string;
    role?: string;
    sandboxOnly?: boolean;
    clubId?: string | null;
    status?: "Pending" | "Approved" | "Denied";
    lastSeen?: string;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const email = String(body?.email ?? "").trim().toLowerCase();
  const name = String(body?.name ?? "").trim();
  const surname = String(body?.surname ?? "").trim();
  const country = String(body?.country ?? "España").trim();
  const role = String(body?.role ?? "promo_coach").trim();
  const clubId =
    typeof body?.clubId === "string" && body.clubId.trim().length > 0
      ? body.clubId.trim()
      : null;
  const sandboxOnly = !!body?.sandboxOnly;
  if (!email || !name) {
    return NextResponse.json({ error: "name y email requeridos" }, { status: 400 });
  }
  const roleOk = await isValidRoleKey(admin, role);
  if (!roleOk) {
    return NextResponse.json({ error: "rol_invalido" }, { status: 400 });
  }
  if (role !== "superadmin" && !clubId) {
    return NextResponse.json({ error: "club_id_requerido_para_rol" }, { status: 400 });
  }

  const { data: existingProfile } = await admin
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (existingProfile?.id) {
    return NextResponse.json({ error: "email_ya_registrado" }, { status: 409 });
  }

  const tempPassword = `Synq#${Math.random().toString(36).slice(-10)}A1`;
  const createRes = await admin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: {
      name: [name, surname].filter(Boolean).join(" "),
      role,
    },
  });
  if (createRes.error || !createRes.data.user?.id) {
    console.error("[SynqAI][admin-users][POST] createUser error:", createRes.error);
    return NextResponse.json({ error: createRes.error?.message ?? "create_user_failed" }, { status: 500 });
  }
  const userId = createRes.data.user.id;

  const { error: profileErr } = await admin.from("profiles").upsert({
    id: userId,
    email,
    name: [name, surname].filter(Boolean).join(" "),
    role,
    country,
    plan: "free",
    club_id: role === "superadmin" ? null : clubId,
    club_created: false,
    sandbox_only: sandboxOnly,
  });
  if (profileErr) {
    console.error("[SynqAI][admin-users][POST] upsert profile error:", profileErr);
    return NextResponse.json({ error: profileErr.message }, { status: 500 });
  }

  const { error: stateErr } = await admin.from("admin_user_states").upsert({
    profile_id: userId,
    status: body?.status ?? "Approved",
    last_seen: body?.lastSeen ?? "Just now",
  });
  if (stateErr) {
    console.error("[SynqAI][admin-users][POST] upsert state error:", stateErr);
    return NextResponse.json({ error: stateErr.message }, { status: 500 });
  }
  if (clubId && role !== "superadmin") {
    const { error: membershipErr } = await admin.from("club_memberships").upsert(
      {
        user_id: userId,
        club_id: clubId,
        role_in_club: role,
        status: "active",
        is_default: true,
        sandbox_scope: sandboxOnly,
      },
      { onConflict: "user_id,club_id" },
    );
    if (membershipErr) {
      console.error("[SynqAI][admin-users][POST] upsert membership error:", membershipErr);
      return NextResponse.json({ error: membershipErr.message }, { status: 500 });
    }
  }

  return NextResponse.json({
    ok: true,
    user: {
      id: userId,
      name: [name, surname].filter(Boolean).join(" "),
      surname,
      email,
      country,
      clubId: role === "superadmin" ? null : clubId,
      sandboxOnly,
      role,
      status: body?.status ?? "Approved",
      lastSeen: body?.lastSeen ?? "Just now",
      source: "remote",
    },
  });
}
