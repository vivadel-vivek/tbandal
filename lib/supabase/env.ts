// Single source of truth for the Supabase env vars. Throws loud + early
// when the project is misconfigured so we don't ship a half-broken
// auth flow that fails silently.
//
// In Vercel: set NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY
// at the project level (both Production + Preview). The service-role key
// is server-only and never NEXT_PUBLIC_; it's read in lib/supabase/admin.ts.
//
// Locally: copy .env.local.example to .env.local and fill in either:
//   - the local Supabase stack values that `supabase status` prints
//     (after `supabase start`), or
//   - the project's hosted values from the dashboard (Settings → API).

export function getSupabasePublicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error(
      "Missing Supabase env: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set. See .env.local.example.",
    );
  }
  return { url, anon };
}

export function getSupabaseServiceKey() {
  const k = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!k) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY. Used only by server-side admin paths.",
    );
  }
  return k;
}
