import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase";

type OutboxJob = {
  id?: string;
  scope?: string;
  op?: string;
  payload?: Record<string, unknown>;
};

type Body = {
  deviceId?: string;
  jobs?: OutboxJob[];
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const deviceId = typeof body.deviceId === "string" ? body.deviceId.trim() : "";
  const jobs = Array.isArray(body.jobs) ? body.jobs : [];
  if (!deviceId || deviceId.length > 128) {
    return NextResponse.json({ ok: false, error: "deviceId_required" }, { status: 400 });
  }
  if (jobs.length === 0) {
    return NextResponse.json({ ok: true, accepted: 0 });
  }
  if (jobs.length > 100) {
    return NextResponse.json({ ok: false, error: "too_many_jobs" }, { status: 413 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) {
    return NextResponse.json({ ok: true, accepted: jobs.length, skipped: true, reason: "no_supabase_url" });
  }

  const rows = jobs
    .filter((j) => typeof j.op === "string" && j.payload !== undefined && typeof j.payload === "object")
    .map((j) => ({
      device_id: deviceId,
      app_scope: typeof j.scope === "string" && j.scope.length > 0 ? j.scope.slice(0, 64) : "sandbox-coach",
      snapshot: {
        outbox_job_id: j.id ?? null,
        op: j.op as string,
        payload: j.payload as Record<string, unknown>,
        received_at: new Date().toISOString(),
      },
    }));

  if (rows.length === 0) {
    return NextResponse.json({ ok: false, error: "no_valid_jobs" }, { status: 400 });
  }

  let error: { message: string } | null = null;

  if (serviceKey) {
    const admin = createClient<Database>(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const res = await admin.from("sandbox_device_snapshots").insert(rows);
    error = res.error;
  } else if (anonKey) {
    const pub = createClient<Database>(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const res = await pub.from("sandbox_device_snapshots").insert(rows);
    error = res.error;
  } else {
    return NextResponse.json({ ok: true, accepted: rows.length, skipped: true, reason: "no_supabase_keys" });
  }

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, accepted: rows.length });
}
