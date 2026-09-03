import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("tracks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ tracks: data ?? [] });
  } catch (err) {
    return NextResponse.json(
      { tracks: [], error: err instanceof Error ? err.message : "Erreur inconnue" },
      { status: 200 } // on ne casse jamais l'affichage public pour une erreur serveur
    );
  }
}

export async function POST(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const body = await req.json().catch(() => null);
  const { name, url, storage_path, size, duration, lyrics } = body ?? {};

  if (!name || !url || !storage_path) {
    return NextResponse.json({ error: "Champs manquants." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("tracks")
      .insert({
        name,
        url,
        storage_path,
        size: size ?? null,
        duration: duration ?? null,
        lyrics: lyrics ?? null,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ track: data });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erreur inconnue" },
      { status: 500 }
    );
  }
}
