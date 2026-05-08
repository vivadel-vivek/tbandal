// One-shot: ensure James + Vivek exist in the hosted Supabase project
// and send each a setup email so they can pick a password.
//
// Behavior per email:
//  - If no auth.users row exists: admin.auth.admin.inviteUserByEmail()
//    creates the user and emails a magic link to set up the account.
//  - If a row already exists: admin.auth.admin.generateLink({type:
//    "recovery"}) returns a password-reset URL we send via the
//    same-name resetPasswordForEmail (which produces a real email).
//
// Either way the user clicks an email link, lands on /auth/callback,
// chooses a password, and the role is already set on their profile.

import { createClient } from "@supabase/supabase-js";
import { config as loadEnv } from "dotenv";
import WS from "ws";
if (!globalThis.WebSocket) globalThis.WebSocket = WS;

loadEnv({ path: ".env.production" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing Supabase env in .env.production");
  process.exit(1);
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://two-buds-and-a-leaf.vercel.app";

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Two staff. James gets contributor (per earlier convo we'll promote
// to admin once he gets his bearings); Vivek is admin from day one.
const STAFF = [
  { email: "vivek@vpshimpi.com", role: "admin",       displayName: "Vivek", contributorHandle: "vivek" },
  { email: "grimardjm@gmail.com", role: "contributor", displayName: "James", contributorHandle: "james" },
];

console.log(`→ inviting staff into ${url}\n`);

async function findUserByEmail(email) {
  const { data } = await admin.auth.admin.listUsers({ perPage: 200 });
  return data?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
}

async function ensureProfile(userId, role, displayName, contributorHandle) {
  const { error } = await admin
    .from("profiles")
    .update({ role, display_name: displayName, contributor_handle: contributorHandle })
    .eq("id", userId);
  if (error) throw error;
}

for (const s of STAFF) {
  process.stdout.write(`${s.email} (${s.role})… `);
  let user = await findUserByEmail(s.email);

  if (!user) {
    // No account → invite (creates user + emails setup link).
    const { data, error } = await admin.auth.admin.inviteUserByEmail(s.email, {
      redirectTo: `${SITE_URL}/auth/callback?next=/admin/contributor`,
    });
    if (error) {
      console.error(`✗ invite failed: ${error.message}`);
      continue;
    }
    user = data.user;
    process.stdout.write("created + invited; ");
  } else {
    // Exists → send a recovery email so they can pick a new password.
    const { error } = await admin.auth.resetPasswordForEmail(s.email, {
      redirectTo: `${SITE_URL}/auth/callback?next=/admin/contributor`,
    });
    if (error) {
      console.error(`✗ password-reset failed: ${error.message}`);
      continue;
    }
    process.stdout.write("exists + reset email queued; ");
  }

  // Set the role on profiles. The signup trigger created the row with
  // role='user'; we promote here. RLS bypassed by service-role.
  await ensureProfile(user.id, s.role, s.displayName, s.contributorHandle);
  console.log(`role=${s.role} ✓`);
}

console.log("\nDone. Each will get a real email from Supabase. Click the link, set a password, land on /admin/contributor.");
