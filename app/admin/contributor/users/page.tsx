// User management — admin-only inside the contributor portal layout.
// Lists every profile with email + role + signup date and lets an
// admin change roles inline. The layout's requireStaff() guard
// already blocks non-staff; this page additionally short-circuits
// on contributor (read-only banner) so a contributor browsing here
// can't mistake the table for something they can edit.

import { requireRole } from "@/lib/auth/require-role";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { UserRoleSelect } from "@/components/admin/UserRoleSelect";

export default async function ContributorUsersPage() {
  // Read-only fall-through for non-admin staff. requireStaff (in the
  // layout) has already let them in.
  const sb = await createSupabaseServerClient();
  const { data: { user: caller } } = await sb.auth.getUser();
  const { data: callerProfile } = await sb
    .from("profiles")
    .select("role")
    .eq("id", caller!.id)
    .single();
  const callerIsAdmin = callerProfile?.role === "admin";

  // Use the admin client to read every profile (RLS hides others'
  // rows from non-admins; we want to show all here).
  const admin = createSupabaseAdminClient();
  const { data: users, error } = await admin
    .from("profiles")
    .select("id, email, display_name, role, contributor_handle, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
        <h1 className="font-display italic text-burgundy text-[28px] m-0">
          Users
        </h1>
        <span className="text-[10px] tracking-widest uppercase font-bold text-warm-600">
          {(users ?? []).length} accounts
        </span>
      </div>

      {!callerIsAdmin && (
        <div className="bg-cream border border-warm-200 rounded-md px-4 py-3 mb-4 text-[12px] text-warm-700 leading-snug">
          Read-only — only admins can change roles. Email{" "}
          <a href="mailto:hello@twobudsandaleaf.com" className="text-burgundy underline">
            hello@twobudsandaleaf.com
          </a>{" "}
          if a role needs adjusting.
        </div>
      )}

      <p className="text-[12px] text-warm-600 mb-5 max-w-[640px]">
        Roles in order of access: <strong>admin</strong> (everything) ·{" "}
        <strong>contributor</strong> (catalog editor + journal) ·{" "}
        <strong>vendor</strong> (their own storefront only) ·{" "}
        <strong>member</strong> (paid tier) · <strong>user</strong> (free
        tier). Promotions take effect on the user&apos;s next request.
      </p>

      <ul className="divide-y divide-warm-200 border border-warm-200 rounded-xl bg-[var(--bg-elevated)]">
        {(users ?? []).map((u) => {
          const isSelf = u.id === caller!.id;
          return (
            <li
              key={u.id}
              className="px-5 py-3.5 flex items-center gap-4 justify-between flex-wrap"
            >
              <div className="min-w-0 flex-1">
                <div className="font-display text-burgundy text-[16px] truncate">
                  {u.email ?? "(no email)"}
                  {isSelf && (
                    <span className="ml-2 text-[10px] tracking-widest uppercase font-bold text-warm-600 not-italic">
                      You
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-warm-600 truncate">
                  {u.display_name ?? "—"}
                  {u.contributor_handle && ` · @${u.contributor_handle}`}
                  {" · "}
                  joined{" "}
                  {new Date(u.created_at).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </div>
              {callerIsAdmin && !isSelf ? (
                <UserRoleSelect userId={u.id} role={u.role} />
              ) : (
                <span
                  className={[
                    "inline-flex items-center px-2.5 py-1 rounded-pill text-[10px] font-bold tracking-widest uppercase border shrink-0",
                    u.role === "admin"       ? "bg-burgundy-muted border-burgundy text-burgundy"
                    : u.role === "contributor" ? "bg-sage-soft border-sage text-forest"
                    : u.role === "vendor"      ? "bg-gold/20 border-gold text-burgundy"
                    : "bg-warm-100 border-warm-300 text-warm-700",
                  ].join(" ")}
                >
                  {u.role}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
