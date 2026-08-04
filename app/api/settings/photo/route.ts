import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/require-admin";
import { BUCKET_ASSETS } from "@/lib/supabase-client";

export const runtime = "nodejs";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_SIZE = 10 * 1024 * 1024; // 10 Mo
const ROW_ID = 1;

export async function POST(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Image trop volumineuse (10 Mo max)." }, { status: 400 });
  }
  if (file.type && !ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Format d'image non supporté." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const ext = file.name.split(".").pop() || "jpg";
    const path = `artist-photo-${Date.now()}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_ASSETS)
      .upload(path, Buffer.from(arrayBuffer), {
        contentType: file.type || "image/jpeg",
        upsert: false,
      });
    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage.from(BUCKET_ASSETS).getPublicUrl(path);

    const { error: settingsError } = await supabase
      .from("site_settings")
      .upsert({ id: ROW_ID, photo_url: publicUrlData.publicUrl });
    if (settingsError) throw settingsError;

    return NextResponse.json({ photo_url: publicUrlData.publicUrl });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Échec de l'upload." },
      { status: 500 }
    );
  }
}
