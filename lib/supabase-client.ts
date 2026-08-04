import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * Client public : utilisé uniquement pour lire les morceaux (SELECT)
 * et écouter les mises à jour en temps réel. Toute écriture (insert,
 * delete, update) passe par les routes /api/* côté serveur, protégées
 * par la session admin + la clé service_role. Pense à activer les RLS
 * Supabase suivantes sur la table `tracks` :
 *
 *   - SELECT: autorisé pour `anon`
 *   - INSERT / UPDATE / DELETE: interdits pour `anon` (la clé service_role
 *     bypass les RLS, donc les routes admin fonctionnent quand même)
 */
export const supabasePublic = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  realtime: { params: { eventsPerSecond: 5 } },
});

export const BUCKET_TRACKS = "musiques";
export const BUCKET_ASSETS = "assets";
