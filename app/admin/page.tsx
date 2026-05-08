// /admin — role-aware redirect into the right portal. Cleaner URL
// for invite emails and bookmarks than /admin/contributor.

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminLanding() {
  const sb = await createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();

  if (!user) redirect("/login?next=/admin");

  const { data: profile } = await sb
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  switch (profile?.role) {
    case "admin":
    case "contributor":
      redirect("/admin/contributor");
    case "vendor":
      redirect("/admin/vendor");
    default:
      redirect("/?msg=forbidden");
  }
}
