import { test, expect, type Page } from "@playwright/test";
import { signInAs, type TestRole } from "./helpers/auth";

// =====================================================================
// Access-control suite — verifies which routes each role can reach.
//
// Matrix shape: per-route, list which tiers should land on the route
// (status 200 OR a redirect to the route's own URL after the auth
// dance settles), vs which should be redirected away (e.g. /login,
// /), or get a 403/404 (future Phase D/E admin pages).
//
// Today's gates:
//   - Public routes: anyone, including anonymous.
//   - Member surfaces (/member, /member/library, /member/settings,
//     /account, /account/password): require auth; anonymous redirected
//     to /login.
//
// Future gates (stubbed entries below — each test reads `expectedTier`
// and skips when the route isn't yet implemented):
//   - /admin/contributor/*: admin + contributor only.
//   - /admin/vendor/*:      admin + vendor only.
// =====================================================================

type Allow = "public" | "any-authed" | "admin" | "contributor" | "vendor" | "member";
type Outcome = "ok" | "redirect-login" | "redirect-home" | "forbidden";

type RouteCase = {
  path: string;
  /** Who should reach the route. Determines the expected outcome per role. */
  allow: Allow;
  /** When true, skip until the route exists. Used for Phase D/E placeholders. */
  notImplemented?: boolean;
};

const ROUTES: RouteCase[] = [
  // Public surfaces — anyone, no auth.
  { path: "/",                                                          allow: "public" },
  { path: "/discover",                                                  allow: "public" },
  { path: "/discover/teas",                                             allow: "public" },
  { path: "/discover/vendors",                                          allow: "public" },
  { path: "/discover/teaware",                                          allow: "public" },
  { path: "/discover/glossary",                                         allow: "public" },
  { path: "/journal",                                                   allow: "public" },
  { path: "/journal/second-steep",                                      allow: "public" },
  { path: "/about",                                                     allow: "public" },
  { path: "/for-vendors",                                               allow: "public" },
  { path: "/tea/white2tea/menghai-shen-puer-spring-2023",               allow: "public" },
  { path: "/discover/teaware/jingdezhen-100ml-gaiwan",                  allow: "public" },

  // Auth-only surfaces.
  { path: "/account",                                                   allow: "any-authed" },
  { path: "/account/password",                                          allow: "any-authed" },
  { path: "/member",                                                    allow: "any-authed" },
  { path: "/member/library",                                            allow: "any-authed" },
  { path: "/member/settings",                                           allow: "any-authed" },

  // Phase D/E — future role-gated portals. Marked notImplemented;
  // the test file stays in lockstep so when those land, the gates
  // are immediately enforced.
  { path: "/admin/contributor",                                         allow: "contributor", notImplemented: true },
  { path: "/admin/vendor",                                              allow: "vendor",      notImplemented: true },
];

// Map (allow tier, current role) → expected outcome. Anonymous is
// represented by null role.
function expectedOutcome(allow: Allow, role: TestRole | null): Outcome {
  if (allow === "public") return "ok";

  if (role === null) {
    // Anonymous always redirects to login when the route requires auth.
    return "redirect-login";
  }

  if (allow === "any-authed") return "ok";

  // Admin can reach every authed surface (acts as superuser).
  if (role === "admin") return "ok";

  if (allow === "admin") return "forbidden";
  if (allow === "contributor") return role === "contributor" ? "ok" : "forbidden";
  if (allow === "vendor") return role === "vendor" ? "ok" : "forbidden";
  if (allow === "member") return role === "member" ? "ok" : "forbidden";

  return "forbidden";
}

async function visitAndAssert(
  page: Page,
  route: RouteCase,
  outcome: Outcome,
) {
  const resp = await page.goto(route.path, { waitUntil: "domcontentloaded" });
  const status = resp?.status() ?? 0;

  switch (outcome) {
    case "ok":
      expect(status, `${route.path} should be reachable`).toBeLessThan(400);
      // For redirected routes the URL won't match exactly; check that
      // we DIDN'T end up at /login or /.
      expect(page.url(), `${route.path} should not redirect to login`).not.toMatch(/\/login(\?|$)/);
      break;
    case "redirect-login":
      // Server-side redirect from a /member/* or /account/* page when
      // anonymous. End state: URL contains /login.
      expect(page.url(), `${route.path} should redirect to /login`).toMatch(/\/login(\?|$)/);
      break;
    case "redirect-home":
      expect(new URL(page.url()).pathname, `${route.path} should redirect to /`).toBe("/");
      break;
    case "forbidden":
      // Either a 403 status OR a redirect away (depending on how we
      // implement role gates in future phases). Accept both for now.
      expect(
        status === 403 || /\/(login|$)/.test(new URL(page.url()).pathname),
        `${route.path} should forbid ${outcome}`,
      ).toBeTruthy();
      break;
  }
}

// =====================================================================
// Anonymous (no sign-in)
// =====================================================================
test.describe("anonymous", () => {
  for (const route of ROUTES) {
    if (route.notImplemented) continue;
    const outcome = expectedOutcome(route.allow, null);
    test(`${route.path} → ${outcome}`, async ({ page }) => {
      await visitAndAssert(page, route, outcome);
    });
  }
});

// =====================================================================
// One block per signed-in tier.
// =====================================================================
const TIERS: TestRole[] = ["admin", "contributor", "vendor", "member", "user"];

for (const role of TIERS) {
  test.describe(`role=${role}`, () => {
    test.beforeEach(async ({ page }) => {
      await signInAs(page, role);
    });

    for (const route of ROUTES) {
      if (route.notImplemented) continue;
      const outcome = expectedOutcome(route.allow, role);
      test(`${route.path} → ${outcome}`, async ({ page }) => {
        await visitAndAssert(page, route, outcome);
      });
    }
  });
}
