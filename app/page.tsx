import SiteExperience from "@/components/SiteExperience";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { DEFAULT_SETTINGS, type Track, type SiteSettings } from "@/types";

export const dynamic = "force-dynamic";

async function getInitialData(): Promise<{ tracks: Track[]; settings: SiteSettings }> {
  try {
    const supabase = getSupabaseAdmin();
    const [{ data: tracks }, { data: settingsRow }] = await Promise.all([
      supabase.from("tracks").select("*").order("created_at", { ascending: false }),
      supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
    ]);
    return {
      tracks: tracks ?? [],
      settings: { ...DEFAULT_SETTINGS, ...(settingsRow ?? {}) },
    };
  } catch {
    return { tracks: [], settings: DEFAULT_SETTINGS };
  }
}

export default async function Home() {
  const { tracks, settings } = await getInitialData();
  return <SiteExperience initialTracks={tracks} initialSettings={settings} />;
}
