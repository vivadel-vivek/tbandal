import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv, getSupabaseServiceKey } from "./env";
import type { Database } from "./types";

// Admin (service-role) Supabase client — bypasses RLS entirely. Use ONLY
// from server-side code that has already authenticated the caller and
// established their right to perform the operation (e.g. a webhook
// handler verifying the signature, or a route handler that has already
// called requireRole("admin")).
//
// NEVER import this from a client component or expose its instance to
// the client bundle. The service key has full table access and must
// stay server-only.
export function createSupabaseAdminClient() {
  const { url } = getSupabasePublicEnv();
  const serviceKey = getSupabaseServiceKey();
  return createClient<Database>(url, serviceKey, {
    auth: {
      // Admin client doesn't manage user sessions; disable cookie /
      // refresh-token persistence so it acts as a stateless service.
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
