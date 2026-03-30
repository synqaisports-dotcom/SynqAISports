import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type IncomingEvent = {
  id?: string;
  type?: string;
  timestamp?: string;
  metadata?: Record<string, unknown>;
};

type IncomingBody = {
  events?: IncomingEvent[];
  sentAt?: string;
  app?: string;
};

export async function POST(req: Request) {
  let body: IncomingBody;
  try {
    body = (await req.json()) as IncomingBody;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const events = Array.isArray(body.events) ? body.events : [];
  if (events.length === 0) {
    return NextResponse.json({ ok: true, accepted: 0 });
  }
  if (events.length > 1000) {
    return NextResponse.json({ ok: false, error: "too_many_events" }, { status: 413 });
  }

  const normalized = events
    .filter((e) => typeof e.type === "string" && typeof e.timestamp === "string")
    .map((e) => ({
      event_id: String(e.id || ""),
      event_type: String(e.type),
      event_ts: String(e.timestamp),
      metadata: (e.metadata ?? {}) as Record<string, unknown>,
      app: typeof body.app === "string" ? body.app : "synqai-sports",
      ingested_at: new Date().toISOString(),
    }));

  if (normalized.length === 0) {
    return NextResponse.json({ ok: false, error: "invalid_events_payload" }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ ok: false, error: "supabase_unconfigured" }, { status: 503 });
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Tabla esperada en Supabase: ad_events_queue
  const { error } = await admin.from("ad_events_queue").insert(normalized);
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, accepted: normalized.length });
}
