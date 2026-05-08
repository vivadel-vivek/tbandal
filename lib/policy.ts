// Policy versioning — the canonical record of what users are agreeing
// to when they sign up. Bump these when /privacy or /terms changes
// materially; non-material edits (typo fixes, formatting) shouldn't
// bump. Date-stamp form is human-readable in the audit log.
//
// The signup form passes these values to supabase.auth.signUp via
// options.data, the handle_new_user trigger records them on the
// profile + into consent_log, and admin tooling can list everyone
// who's now out of date with:
//
//   select id from profiles where privacy_version != POLICY_VERSIONS.privacy;
//
// When you bump a version: deploy the new policy text, bump the
// constant in this file in the same commit, then run the notification
// flow against the resulting list of out-of-date users.

export const POLICY_VERSIONS = {
  /** /privacy page content version. */
  privacy: "2026-05-08",
  /** /terms page content version. */
  terms: "2026-05-08",
} as const;

export type PolicyDocument = keyof typeof POLICY_VERSIONS;
