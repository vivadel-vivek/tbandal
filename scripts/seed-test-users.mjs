// Seed pseudo users at every role tier for the Playwright RBAC suite.
//
// Why exists: integration tests need users at admin / contributor /
// vendor / member / user tiers, plus an anonymous control. Going
// through email confirmation in CI / dev is friction — the Supabase
// admin SDK lets us create users with `email_confirm: true` and
// upserts their role via service-role-bypassed SQL.
//
// Idempotent: re-running rotates passwords and resets roles to the
// canonical values, so a flaky test run never poisons subsequent runs.
//
// Outputs: tests/.test-users.json with credentials the suite reads.
// That file is gitignored — the generated passwords are random per
// run; nothing here ever touches a real human's account.

import { createClient } from "@supabase/supabase-js";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { config as loadEnv } from "dotenv";
// Node 20 doesn't have a global WebSocket. The Supabase realtime
// client breaks at construction time without one — provide ws so the
// admin client builds (we never actually open a realtime channel).
import WS from "ws";
if (!globalThis.WebSocket) {
  globalThis.WebSocket = WS;
}

// Pass `--remote` (or set SEED_TARGET=remote) to seed against the
// hosted Supabase project read from .env.production. Default reads
// .env.local for the local stack. The credentials file lives at
// tests/.test-users.json regardless of target — gitignored, rewritten
// on every run.
const target = process.argv.includes("--remote") || process.env.SEED_TARGET === "remote"
  ? "remote" : "local";

loadEnv({ path: target === "remote" ? ".env.production" : ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error(
    `Missing Supabase env for target=${target}. Set NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.${target === "remote" ? "production" : "local"}.`,
  );
  process.exit(1);
}

console.log(`→ seeding test users into ${target} (${url})`);

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Email-domain `tbal-tests.local` is reserved for these — never matches
// a real user. The five tiers map directly to the user_role enum.
const TIERS = ["admin", "contributor", "vendor", "member", "user"];

function randomPassword() {
  // 18 mixed chars; printable, no special-char issues in URLs / shells.
  const a = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const b = "abcdefghjkmnpqrstuvwxyz";
  const c = "23456789";
  const all = a + b + c;
  let p = "";
  for (let i = 0; i < 18; i++) p += all[Math.floor(Math.random() * all.length)];
  return p;
}

async function ensureUser(role) {
  const email = `${role}@tbal-tests.local`;
  const password = randomPassword();

  // Look up an existing user — admin.listUsers paginates; for our 5
  // users a single page is plenty.
  const { data: list } = await admin.auth.admin.listUsers({ perPage: 200 });
  const existing = list?.users.find((u) => u.email === email);

  let userId;
  if (existing) {
    // Update password + ensure email is confirmed.
    const { error } = await admin.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
    });
    if (error) throw error;
    userId = existing.id;
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) throw error;
    userId = data.user.id;
  }

  // Force the role on profiles. The signup trigger created the row
  // with role='user'; we need to push it to the test tier. Using the
  // admin client bypasses the RLS that normally locks role changes.
  const { error: roleErr } = await admin
    .from("profiles")
    .update({ role, display_name: `Test ${role}` })
    .eq("id", userId);
  if (roleErr) throw roleErr;

  return { role, email, password, userId };
}

async function main() {
  const results = [];
  for (const role of TIERS) {
    process.stdout.write(`seeding ${role}…`);
    const r = await ensureUser(role);
    process.stdout.write(` ✓ ${r.userId}\n`);
    results.push(r);
  }

  const outPath = join("tests", ".test-users.json");
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`\nWrote ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
