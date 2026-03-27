import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifySuperadminFromRequest } from "../verify-superadmin";

type CollabRow = {
  id?: string;
  submission_type?: "feedback" | "lead" | string;
  created_at?: string;
  email?: string | null;
  club_name?: string | null;
  contact_person?: string | null;
  message?: string | null;
  feedback?: string | null;
  notes?: string | null;
};

export async function GET(req: Request) {
  const gate = await verifySuperadminFromRequest(req);
  if (!gate.ok) {
    return NextResponse.json({ ok: false, error: gate.message }, { status: gate.status });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ ok: false, offline: true, error: "Supabase no configurado." }, { status: 501 });
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await admin
    .from("sandbox_collaboration_submissions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(300);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as CollabRow[];
  const items = rows.map((r, idx) => {
    const isLead = r.submission_type === "lead";
    const rawMsg = r.message || r.feedback || r.notes || "";
    const detail = rawMsg.trim()
      ? rawMsg.trim()
      : isLead
        ? [r.contact_person, r.club_name].filter(Boolean).join(" · ") || "Lead recibido desde sandbox."
        : "Feedback recibido desde sandbox.";

    return {
      id: r.id ?? `${r.submission_type ?? "item"}_${idx}`,
      submissionType: (r.submission_type ?? "feedback") as "feedback" | "lead",
      timestamp: r.created_at ?? new Date().toISOString(),
      desc: detail,
      email: r.email ?? null,
      clubName: r.club_name ?? null,
      contactPerson: r.contact_person ?? null,
    };
  });

  return NextResponse.json({ ok: true, items });
}
