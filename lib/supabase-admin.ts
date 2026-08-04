import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Client admin, instancié à la demande (jamais au chargement du module)
 * pour ne pas casser le build si les variables d'env ne sont pas encore
 * configurées. N'importer ce fichier que depuis des routes API / server
 * actions — jamais depuis un composant client.
 */
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Supabase admin non configuré : NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis (voir .env.local.example)."
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
