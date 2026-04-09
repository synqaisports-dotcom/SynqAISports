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

  return NextResponse.json({
    ok: true,
    gate: { userId: gate.userId },
    env,
    db,
  });
}

