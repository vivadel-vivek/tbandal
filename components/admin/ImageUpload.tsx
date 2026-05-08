"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { uploadEditorialImage, uploadAvatarImage } from "@/app/admin/contributor/upload-actions";

// Click-or-drop image upload widget for the admin forms.
//
//  - Accepts JPEG / PNG / WebP up to 5 MB (server enforces too).
//  - Posts via a server action (`uploadEditorialImage` /
//    `uploadAvatarImage`). The server returns the public Supabase URL.
//  - Calls `onChange(url)` with the new URL — for editorial uploads
//    the parent form holds it in state and writes to the row on save.
//    Avatar uploads write to the row immediately.
//  - Shows a small thumbnail preview when a URL is present, with
//    Replace / Remove controls. Remove sets the URL to null in the
//    parent form (the file stays in storage; orphan-cleanup is a
//    later concern).

type EditorialKind = "vendor" | "tea" | "teaware" | "post";

type Props = {
  /** Current image URL, or null if no image has been uploaded yet. */
  value: string | null;
  /** Called with the new URL after a successful upload, or null on remove. */
  onChange: (url: string | null) => void;
  /** Aspect ratio for the preview thumbnail. Match the display surface. */
  aspectRatio?: string;
  /** Editorial uploads need a kind + slug for the path; avatar uploads use
   *  the auth context. Pass `kind="avatar"` to use the avatar action. */
  kind: EditorialKind | "avatar";
  /** Slug for editorial uploads (used as a folder prefix). */
  slug?: string;
  /** Avatar target — "self" or "contributor". Required when kind="avatar". */
  avatarTarget?: "self" | "contributor";
  /** Contributor handle when avatarTarget="contributor". */
  contributorHandle?: string;
  /** Optional alt text for accessibility (default: "Uploaded image"). */
  alt?: string;
  /** Optional label shown above the dropzone. */
  label?: string;
};

export function ImageUpload({
  value,
  onChange,
  aspectRatio = "16/10",
  kind,
  slug,
  avatarTarget = "self",
  contributorHandle,
  alt = "Uploaded image",
  label,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const upload = (file: File) => {
    setError(null);
    const fd = new FormData();
    fd.set("file", file);
    if (kind === "avatar") {
      fd.set("target", avatarTarget);
      if (contributorHandle) fd.set("handle", contributorHandle);
    } else {
      fd.set("kind", kind);
      fd.set("slug", slug ?? "untitled");
    }
    startTransition(async () => {
      const action = kind === "avatar" ? uploadAvatarImage : uploadEditorialImage;
      const result = await action(fd);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      onChange(result.url);
    });
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) upload(f);
    // Reset so picking the same file twice still fires onChange.
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) upload(f);
  };

  return (
    <div>
      {label && (
        <div className="block text-[10px] tracking-widest uppercase font-bold text-warm-600 mb-1.5">
          {label}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={onPick}
        className="hidden"
      />

      {value ? (
        <div className="space-y-2">
          <div
            className="relative rounded-lg overflow-hidden border border-warm-300 bg-warm-100"
            style={{ aspectRatio }}
          >
            <Image
              src={value}
              alt={alt}
              fill
              sizes="(max-width: 640px) 100vw, 480px"
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={() => fileRef.current?.click()}
              className="text-[12px] font-bold text-burgundy bg-cream border border-warm-300 rounded-pill px-3 py-1.5 cursor-pointer hover:border-burgundy disabled:opacity-50"
            >
              {pending ? "Uploading…" : "Replace"}
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="text-[12px] font-bold text-warm-600 cursor-pointer hover:text-burgundy"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={pending}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={[
            "w-full rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-colors",
            dragOver ? "border-burgundy bg-cream" : "border-warm-300 bg-warm-100",
            "py-8 px-4",
          ].join(" ")}
          style={{ aspectRatio }}
        >
          <span className="text-[14px] font-bold text-forest">
            {pending ? "Uploading…" : "Click or drop image"}
          </span>
          <span className="text-[11px] text-warm-600 mt-1">
            JPEG, PNG, or WebP · up to 5 MB
          </span>
        </button>
      )}

      {error && (
        <p className="text-[12px] text-burgundy mt-2" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
