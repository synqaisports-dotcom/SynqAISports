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

async function safeProbeTable(admin: ReturnType<typeof adminClient>, table: keyof Database["public"]["Tables"]) {
  if (!admin) return { ok: false, error: "admin_client_unavailable" } as const;
  try {
    const { error } = await admin.from(String(table) as any).select("*").limit(1);
    if (error) return { ok: false, error: error.message } as const;
    return { ok: true } as const;
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "probe_failed" } as const;
  }
}

export async function GET(req: Request) {
  const gate = await verifySuperadminFromRequest(req);
  if (!gate.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: gate.message,
        status: gate.status,
        checks: [
          {
            id: "superadmin_gate",
            label: "Superadmin Gate",
            ok: false,
            severity: "crit",
            detail: gate.message,
            hint: "Verifica que tu perfil en `profiles.role` sea `superadmin` y que la sesión llegue al servidor.",
          },
        ],
      },
      { status: gate.status },
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const env = {
    NEXT_PUBLIC_SUPABASE_URL: !!url,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!anon,
    SUPABASE_SERVICE_ROLE_KEY: !!serviceKey,
  };

  const admin = adminClient();
  const db = {
    clubs: await safeProbeTable(admin, "clubs"),
    profiles: await safeProbeTable(admin, "profiles"),
    synq_roles: await safeProbeTable(admin, "synq_roles"),
    club_memberships: await safeProbeTable(admin, "club_memberships"),
    admin_user_states: await safeProbeTable(admin, "admin_user_states"),
  };

  const checks: Array<{
    id: string;
    label: string;
    ok: boolean;
    severity?: "info" | "warn" | "crit";
    detail?: string;
    hint?: string;
  }> = [];

  checks.push({
    id: "superadmin_gate",
    label: "Superadmin Gate",
    ok: true,
    severity: "info",
    detail: `userId=${gate.userId}`,
  });
  checks.push({
    id: "supabase_public_env",
    label: "Supabase Public Env",
    ok: env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    severity: "warn",
    detail: `URL=${env.NEXT_PUBLIC_SUPABASE_URL ? "OK" : "MISSING"} · ANON=${env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "OK" : "MISSING"}`,
    hint: "En Vercel Production, confirma NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.",
  });
  checks.push({
    id: "service_role_key",
    label: "Service Role Key (server)",
    ok: env.SUPABASE_SERVICE_ROLE_KEY,
    severity: "crit",
    detail: env.SUPABASE_SERVICE_ROLE_KEY ? "OK" : "MISSING",
    hint: "Sin SUPABASE_SERVICE_ROLE_KEY, admin-global no puede listar clubs/usuarios globales.",
  });

  const tableChecks: Array<{ id: string; label: string; probe: { ok: boolean; error?: string } }> = [
    { id: "clubs_read", label: "DB: clubs", probe: db.clubs },
    { id: "profiles_read", label: "DB: profiles", probe: db.profiles },
    { id: "synq_roles_read", label: "DB: synq_roles", probe: db.synq_roles },
    { id: "club_memberships_read", label: "DB: club_memberships", probe: db.club_memberships },
    { id: "admin_user_states_read", label: "DB: admin_user_states", probe: db.admin_user_states },
  ];
  for (const t of tableChecks) {
    checks.push({
      id: t.id,
      label: t.label,
      ok: !!t.probe.ok,
      severity: t.id.includes("synq_roles") || t.id.includes("club_memberships") ? "warn" : "crit",
      detail: t.probe.ok ? "OK" : t.probe.error ?? "ERROR",
      hint: !t.probe.ok ? "Revisa migraciones en Supabase y que el service role tenga acceso." : undefined,
    });
  }

  return NextResponse.json({
    ok: true,
    gate: { userId: gate.userId },
    env,
    db,
    checks,
  });
}

