import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/require-admin";
import { BUCKET_TRACKS } from "@/lib/supabase-client";

export const runtime = "nodejs";
export const maxDuration = 60;

const ALLOWED_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/flac",
  "audio/x-flac",
  "audio/mp4",
  "audio/x-m4a", // certains navigateurs renvoient ce type pour les .m4a
  "audio/aac",
  "audio/ogg",
];
const MAX_SIZE = 60 * 1024 * 1024; // 60 Mo

// Le vrai bug était ici : Chrome ne sait pas lire un <audio> dont le
// Content-Type est "audio/x-m4a" (ou vide). On normalise donc le content-type
// stocké dans Supabase à partir de l'extension du fichier, plutôt que de
// faire confiance à file.type qui varie selon le navigateur.
const CONTENT_TYPE_BY_EXT: Record<string, string> = {
  mp3: "audio/mpeg",
  wav: "audio/wav",
  flac: "audio/flac",
  m4a: "audio/mp4", // <- clé du fix : pas "audio/x-m4a"
  mp4: "audio/mp4",
  aac: "audio/aac",
  ogg: "audio/ogg",
};

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export async function POST(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Fichier trop volumineux (60 Mo max)." }, { status: 400 });
  }
  if (file.type && !ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Format audio non supporté." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const ext = file.name.split(".").pop() || "mp3";
    const safeName = file.name
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-zA-Z0-9-_ ]/g, "")
      .trim()
      .slice(0, 60) || "morceau";
    const path = `${Date.now()}-${safeName}.${ext}`;

    const normalizedContentType = CONTENT_TYPE_BY_EXT[ext.toLowerCase()] || file.type || "audio/mpeg";

    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_TRACKS)
      .upload(path, Buffer.from(arrayBuffer), {
        contentType: normalizedContentType,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage.from(BUCKET_TRACKS).getPublicUrl(path);

    return NextResponse.json({
      url: publicUrlData.publicUrl,
      storage_path: path,
      name: safeName,
      size: formatSize(file.size),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Échec de l'upload." },
      { status: 500 }
    );
  }
}