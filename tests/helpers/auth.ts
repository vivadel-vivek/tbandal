import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Page } from "@playwright/test";

// Shared helpers for the access-control suite. All test users live
// in tests/.test-users.json (written by scripts/seed-test-users.mjs);
// loadTestUsers reads that file once per process.

export type TestRole =
  | "admin"
  | "contributor"
  | "vendor"
  | "member"
  | "user";

export type TestUser = {
  role: TestRole;
  email: string;
  password: string;
  userId: string;
};

let cached: TestUser[] | null = null;

export function loadTestUsers(): TestUser[] {
  if (cached) return cached;
  const path = join(process.cwd(), "tests", ".test-users.json");
  try {
    cached = JSON.parse(readFileSync(path, "utf8"));
  } catch (err) {
    throw new Error(
      `Couldn't read ${path}. Run \`npm run test:seed\` first. Underlying: ${err}`,
    );
  }
  return cached!;
}

export function userForRole(role: TestRole): TestUser {
  const u = loadTestUsers().find((x) => x.role === role);
  if (!u) throw new Error(`No seeded user for role=${role}`);
  return u;
}

/** Fills the /login form with the given user's credentials and waits
 *  for the redirect to /member. Throws on auth failure. */
export async function signInAs(page: Page, role: TestRole) {
  const u = userForRole(role);
  await page.goto("/login");
  await page.getByLabel("Email").fill(u.email);
  await page.getByLabel("Password").fill(u.password);
  await page.getByRole("button", { name: /sign in/i }).click();
  // After sign-in we land on /member by default. Wait for the URL to
  // settle so subsequent page.goto calls hit a real authed session.
  await page.waitForURL(/\/member/, { timeout: 10_000 });
}

/** POSTs to /auth/signout via a hidden form so we leave the page
 *  signed out for the next test. Pairs with signInAs. */
export async function signOut(page: Page) {
  await page.evaluate(async () => {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/auth/signout";
    document.body.appendChild(form);
    form.submit();
  });
  await page.waitForURL("**/", { timeout: 10_000 });
}
