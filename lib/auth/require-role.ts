// Server-side role gates. Use from layouts / pages / route handlers
// inside the admin surfaces. Each function reads the session via the
// SSR Supabase client, queries the caller's profile row, and either
// returns the (user, role) tuple or redirects.
//
// Why this exists: middleware.ts refreshes the session on every
// request but we deliberately don't put role checks in middleware —
// pulling the profile from Postgres for every request is wasteful and
// the redirect logic is easier to reason about in the route itself.

import "server-only";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/supabase/types";

const STAFF: UserRole[] = ["admin", "contributor"];

export async function requireStaff(): Promise<{ userId: string; role: UserRole; email: string | null }> {
  const sb = await createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin/contributor");
  }

  const { data: profile, error } = await sb
    .from("profiles")
    .select("role, email")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    // Profile row missing — treat as not-staff. Redirect home so the
    // user gets feedback instead of a 500.
    redirect("/?msg=no-profile");
  }

  if (!STAFF.includes(profile.role)) {
    redirect("/?msg=forbidden");
  }

  return { userId: user.id, role: profile.role, email: profile.email };
}

export async function requireVendorOrAdmin(): Promise<{ userId: string; role: UserRole; email: string | null }> {
  const sb = await createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin/vendor");
  }

  const { data: profile } = await sb
    .from("profiles")
    .select("role, email")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/?msg=no-profile");
  if (profile.role !== "admin" && profile.role !== "vendor") {
    redirect("/?msg=forbidden");
  }
  return { userId: user.id, role: profile.role, email: profile.email };
}

export async function requireRole(roles: UserRole[]): Promise<{ userId: string; role: UserRole }> {
  const sb = await createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await sb
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !roles.includes(profile.role)) {
    redirect("/?msg=forbidden");
  }

  return { userId: user.id, role: profile.role };
}
