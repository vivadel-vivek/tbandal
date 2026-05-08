"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Image upload server actions. Editorial assets (vendor / tea /
// teaware / post heroes) go in the `editorial` bucket; user and
// contributor avatars go in `avatars`. Both buckets are public-read,
// so the URL we return is stable and safe to bake into HTML.
//
// We deliberately don't write the URL to the database here — the
// edit form holds the URL in component state until the user saves
// the row, so they can preview, replace, or remove without
// committing a half-uploaded change to the catalog.

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

type UploadResult =
  | { ok: true; url: string }
  | { ok: false; message: string };

function safeFilename(originalName: string, mime: string): string {
  // Browser-supplied filenames can be arbitrary garbage; sanitise
  // hard. We keep just the extension (from the mime type, since
  // filename extensions can lie) and a timestamp.
  const ext = mime === "image/jpeg" ? "jpg" : mime.split("/")[1];
  const ts = Date.now();
  const r = Math.random().toString(36).slice(2, 8);
  return `${ts}-${r}.${ext}`;
}

async function requireStaffOrVendor() {
  const sb = await createSupabaseServerClient();
  const { data } = await sb.auth.getUser();
  if (!data.user) throw new Error("Sign in required.");
  const { data: profile } = await sb
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();
  const role = profile?.role;
  if (!role || !["admin", "contributor", "vendor"].includes(role)) {
    throw new Error("Not authorised.");
  }
  return { sb, userId: data.user.id, role };
}

/** Upload an editorial hero image (vendor, tea, teaware, post). */
export async function uploadEditorialImage(
  formData: FormData,
): Promise<UploadResult> {
  let ctx;
  try {
    ctx = await requireStaffOrVendor();
  } catch (err) {
    return { ok: false, message: (err as Error).message };
  }
  const { sb } = ctx;

  const file = formData.get("file");
  const kind = String(formData.get("kind") ?? "");
  const slug = String(formData.get("slug") ?? "untitled").replace(
    /[^a-z0-9-]/gi,
    "-",
  );

  if (!(file instanceof File)) {
    return { ok: false, message: "No file received." };
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return { ok: false, message: "Use JPEG, PNG, or WebP." };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, message: "File over 5 MB. Resize first." };
  }
  if (!["vendor", "tea", "teaware", "post"].includes(kind)) {
    return { ok: false, message: "Unknown kind." };
  }

  const path = `${kind}/${slug}/${safeFilename(file.name, file.type)}`;
  const { error } = await sb.storage
    .from("editorial")
    .upload(path, file, {
      contentType: file.type,
      cacheControl: "31536000", // 1 year — URLs include a timestamp so we can bust by re-uploading
      upsert: false,
    });
  if (error) return { ok: false, message: error.message };

  const { data } = sb.storage.from("editorial").getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}

/** Upload a user avatar. Folder is keyed on the user id so RLS lets
 *  the user manage their own files; staff can additionally upload to
 *  the contributors/{handle} folder for byline avatars. */
export async function uploadAvatarImage(
  formData: FormData,
): Promise<UploadResult> {
  const sb = await createSupabaseServerClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return { ok: false, message: "Sign in required." };

  const file = formData.get("file");
  const target = String(formData.get("target") ?? "self");
  // For contributor avatars, target is the contributor handle.
  const handle = String(formData.get("handle") ?? "").replace(
    /[^a-z0-9-]/gi,
    "",
  );

  if (!(file instanceof File)) {
    return { ok: false, message: "No file received." };
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return { ok: false, message: "Use JPEG, PNG, or WebP." };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, message: "File over 5 MB." };
  }

  const folder =
    target === "contributor" && handle
      ? `contributors/${handle}`
      : auth.user.id;
  const path = `${folder}/${safeFilename(file.name, file.type)}`;

  const { error } = await sb.storage
    .from("avatars")
    .upload(path, file, {
      contentType: file.type,
      cacheControl: "31536000",
      upsert: false,
    });
  if (error) return { ok: false, message: error.message };

  const { data } = sb.storage.from("avatars").getPublicUrl(path);
  // Avatar lands directly in the relevant row — different from
  // editorial uploads where the URL stays in form state until save.
  if (target === "self") {
    await sb.from("profiles").update({ avatar_url: data.publicUrl }).eq("id", auth.user.id);
    revalidatePath("/member/settings");
  } else if (target === "contributor" && handle) {
    await sb.from("contributors").update({ avatar_url: data.publicUrl }).eq("handle", handle);
    revalidatePath("/about");
  }
  return { ok: true, url: data.publicUrl };
}
