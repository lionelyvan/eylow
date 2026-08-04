import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/require-admin";
import { BUCKET_TRACKS } from "@/lib/supabase-client";

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const { id } = await ctx.params;

  try {
    const supabase = getSupabaseAdmin();

    const { data: track, error: fetchError } = await supabase
      .from("tracks")
      .select("storage_path")
      .eq("id", id)
      .single();
    if (fetchError) throw fetchError;

    if (track?.storage_path) {
      await supabase.storage.from(BUCKET_TRACKS).remove([track.storage_path]);
    }

    const { error: deleteError } = await supabase.from("tracks").delete().eq("id", id);
    if (deleteError) throw deleteError;

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Échec de la suppression." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const lyrics = typeof body?.lyrics === "string" ? body.lyrics : undefined;

  if (lyrics === undefined) {
    return NextResponse.json({ error: "Rien à mettre à jour." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("tracks")
      .update({ lyrics })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ track: data });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Échec de la mise à jour." },
      { status: 500 }
    );
  }
}
