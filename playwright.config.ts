import { defineConfig, devices } from "@playwright/test";

// =====================================================================
// Playwright config — RBAC + smoke suites.
//
// Pre-reqs the runner expects (documented in TESTING.md):
//   1. Local Supabase up    (npm run supabase:start)
//   2. .env.local populated  (cp from .env.local.example)
//   3. Test users seeded     (npm run test:seed)
//
// The webServer block boots `next dev` if it isn't already running.
// We pin to port 3000 so the BASE_URL is stable across local dev and
// CI. Existing dev servers on other ports won't conflict.
// =====================================================================

export default defineConfig({
  testDir: "./tests",
  // Each spec file owns its own worker — keeps DB state independent
  // when tests touch user_teas / sessions.
  fullyParallel: false,
  workers: 1,
  reporter: [
    ["list"],
    ["html", { outputFolder: "audit-artifacts/playwright-report", open: "never" }],
  ],
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
