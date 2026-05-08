// Open-redirect guard for the `?next=` param that travels through the
// auth flows (/login, /signup, /auth/callback, /auth/reset).
//
// Accept only same-origin paths: must start with a single slash,
// must NOT start with `//` (protocol-relative URL — some browsers
// treat that as cross-origin and follow it). Anything else falls
// back to the default destination so a phishing link like
// /login?next=https://evil.com can never bounce a freshly-authed
// visitor off-site.
//
// Used by: app/login/page.tsx, app/signup/page.tsx, the redirect-on-
// success branches of /auth/callback and /auth/reset.

export function safeNext(
  next: string | null | undefined,
  fallback: string = "/member",
): string {
  if (!next || typeof next !== "string") return fallback;
  if (next.length > 200) return fallback;
  if (!next.startsWith("/")) return fallback;
  if (next.startsWith("//")) return fallback;
  // No backslash either — Windows paths can confuse some URL parsers.
  if (next.includes("\\")) return fallback;
  return next;
}
