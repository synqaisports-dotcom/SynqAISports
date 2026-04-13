import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase";
import { z } from "zod";

const bodySchema = z.object({
  deviceId: z.string().min(8).max(128),
  kind: z.literal("sandbox_session"),
  countryCode: z.string().max(64).optional(),
  locale: z.string().max(32).optional(),
  timeZone: z.string().max(128).optional(),
  path: z.string().max(512).optional(),
});

/**
 * Telemetría anónima de sesión Sandbox (sin PII).
 * Persiste en sandbox_device_snapshots para mapa mundial en admin-global analytics.
 */
export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const { deviceId, kind, countryCode, locale, timeZone, path } = parsed.data;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) {
    return NextResponse.json({ ok: true, skipped: true, reason: "no_supabase_url" });
  }

  const snapshot = {
    op: "sandbox_telemetry",
    payload: {
      kind,
      countryCode: countryCode?.trim() || null,
      locale: locale?.trim() || null,
      timeZone: timeZone?.trim() || null,
      path: path?.trim() || null,
      received_at: new Date().toISOString(),
    },
  };

  const row = {
    device_id: deviceId,
    app_scope: "sandbox-coach",
    snapshot,
  };

  let error: { message: string } | null = null;

  if (serviceKey) {
    const admin = createClient<Database>(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const res = await admin.from("sandbox_device_snapshots").insert(row);
    error = res.error;
  } else if (anonKey) {
    const pub = createClient<Database>(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const res = await pub.from("sandbox_device_snapshots").insert(row);
    error = res.error;
  } else {
    return NextResponse.json({ ok: true, skipped: true, reason: "no_supabase_keys" });
  }

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
