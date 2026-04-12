import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export type SandboxLeadBody = {
  clubName: string;
  country: string;
  city: string;
  address: string;
  email: string;
};

function isNonEmpty(s: unknown): s is string {
  return typeof s === "string" && s.trim().length > 0;
}

/**
 * Captura de lead previo al login del terminal sandbox.
 * Si Supabase no está configurado o la tabla no existe, responde 200 con accepted:false.
 */
export async function POST(req: Request) {
  let body: Partial<SandboxLeadBody>;
  try {
    body = (await req.json()) as Partial<SandboxLeadBody>;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (
    !isNonEmpty(body.clubName) ||
    !isNonEmpty(body.country) ||
    !isNonEmpty(body.city) ||
    !isNonEmpty(body.address) ||
    !isNonEmpty(body.email)
  ) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }

  const email = body.email.trim().toLowerCase();
  const row = {
    club_name: body.clubName.trim(),
    country: body.country.trim(),
    city: body.city.trim(),
    address: body.address.trim(),
    email,
    source: "sandbox_login",
  };

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return NextResponse.json({ ok: true, accepted: false, reason: "no_supabase_service" });
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const res = await admin.from("sandbox_terminal_leads").insert(row);
  if (res.error) {
    return NextResponse.json({ ok: false, error: res.error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, accepted: true });
}
