import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/require-admin";
import { DEFAULT_SETTINGS } from "@/types";

const ROW_ID = 1;

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", ROW_ID)
      .maybeSingle();

    if (error) throw error;
    return NextResponse.json({ settings: { ...DEFAULT_SETTINGS, ...(data ?? {}) } });
  } catch {
    // Table pas encore créée / pas configurée -> on retombe sur les valeurs par défaut
    return NextResponse.json({ settings: DEFAULT_SETTINGS });
  }
}

export async function PUT(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const allowedKeys = Object.keys(DEFAULT_SETTINGS);
  const patch: Record<string, string> = {};
  for (const key of allowedKeys) {
    if (typeof body[key] === "string") patch[key] = body[key];
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("site_settings")
      .upsert({ id: ROW_ID, ...patch })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ settings: { ...DEFAULT_SETTINGS, ...data } });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Échec de la mise à jour." },
      { status: 500 }
    );
  }
}
