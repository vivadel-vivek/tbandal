"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createApiKey,
  revokeApiKey,
} from "@/app/member/settings/api-keys-actions";
import { Button } from "@/components/ui/Button";

// API key management panel. Lives inside MemberSettingsView and is
// only mounted when the server confirms the caller has admin or
// contributor role (the actions also re-check, defense in depth).
//
// UX:
//   - Create: name input + button. On success, the raw key is shown
//     ONCE in a copy-friendly block with a hard warning that it
//     won't be shown again.
//   - List: existing keys with prefix + name + dates + revoke button.
//   - Revoked keys show in the list with a "Revoked" badge — they're
//     audit history, not deletable.

type KeyRow = {
  id: string;
  name: string;
  prefix: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
};

export function ApiKeysPanel({ initial }: { initial: KeyRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [justCreated, setJustCreated] = useState<{
    raw: string;
    prefix: string;
  } | null>(null);

  const onCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setJustCreated(null);
    if (!name.trim()) {
      setError("Give the key a name (e.g. MacBook or CI).");
      return;
    }
    startTransition(async () => {
      const result = await createApiKey(name);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setJustCreated({ raw: result.data!.raw, prefix: result.data!.prefix });
      setName("");
      router.refresh();
    });
  };

  const onRevoke = (id: string) => {
    if (!confirm("Revoke this key? Anything using it will start getting 401.")) {
      return;
    }
    startTransition(async () => {
      const result = await revokeApiKey(id);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      router.refresh();
    });
  };

  const liveKeys = initial.filter((k) => !k.revoked_at);
  const revoked = initial.filter((k) => k.revoked_at);

  return (
    <div className="space-y-4">
      {justCreated && (
        <div
          role="status"
          className="rounded-lg border border-burgundy bg-cream p-4"
        >
          <div className="text-[11px] tracking-widest uppercase font-bold text-burgundy mb-2">
            Copy this key now
          </div>
          <p className="text-[12px] text-warm-700 leading-snug mb-2 m-0">
            This is the only time we&apos;ll show it. Store it somewhere
            safe (a password manager, your shell env). If you lose it,
            generate a new one.
          </p>
          <pre className="bg-[var(--bg-elevated,#FFF)] border border-warm-300 rounded-md p-3 font-mono text-[12px] overflow-x-auto m-0">
            {justCreated.raw}
          </pre>
        </div>
      )}

      <form onSubmit={onCreate} className="flex gap-2 flex-wrap items-end">
        <label className="flex-1 min-w-[200px]">
          <span className="block text-[10px] font-bold tracking-widest uppercase text-warm-600 mb-1">
            Key name
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={64}
            placeholder="MacBook, CI, etc."
            className="w-full px-3 py-2 rounded-md border border-warm-300 bg-cream text-[14px] focus:outline-none focus:border-burgundy"
          />
        </label>
        <Button variant="primary" disabled={pending}>
          {pending ? "Creating…" : "Create key"}
        </Button>
      </form>

      {error && (
        <div
          role="alert"
          className="text-[12px] text-burgundy bg-burgundy-muted px-3 py-2 rounded-md"
        >
          {error}
        </div>
      )}

      {liveKeys.length > 0 && (
        <ul className="list-none p-0 m-0 divide-y divide-warm-200 border border-warm-200 rounded-lg bg-[var(--bg-elevated,#FFF)]">
          {liveKeys.map((k) => (
            <li
              key={k.id}
              className="px-4 py-3 flex items-center gap-3 flex-wrap"
            >
              <div className="flex-1 min-w-[180px]">
                <div className="font-display italic text-burgundy text-[15px]">
                  {k.name}
                </div>
                <div className="font-mono text-[11px] text-warm-600">
                  tbl_{k.prefix}…{" · "}
                  created {fmtDate(k.created_at)}
                  {k.last_used_at
                    ? ` · last used ${fmtDate(k.last_used_at)}`
                    : " · never used"}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onRevoke(k.id)}
                disabled={pending}
                className="text-[11px] font-bold tracking-widest uppercase text-burgundy bg-cream border border-warm-300 rounded-pill px-3 py-1.5 cursor-pointer hover:border-burgundy disabled:opacity-50"
              >
                Revoke
              </button>
            </li>
          ))}
        </ul>
      )}

      {liveKeys.length === 0 && !justCreated && (
        <p className="text-[12px] text-warm-600 italic m-0">
          No active keys. Create one above to start pushing content via
          the API.
        </p>
      )}

      {revoked.length > 0 && (
        <details>
          <summary className="text-[11px] font-bold tracking-widest uppercase text-warm-600 cursor-pointer">
            Revoked ({revoked.length})
          </summary>
          <ul className="list-none p-0 m-0 mt-2 divide-y divide-warm-200 border border-warm-200 rounded-lg bg-cream">
            {revoked.map((k) => (
              <li
                key={k.id}
                className="px-4 py-2 flex items-center justify-between gap-2"
              >
                <span className="text-[12px] text-warm-600">
                  <span className="font-display italic">{k.name}</span>{" "}
                  · tbl_{k.prefix}…
                </span>
                <span className="text-[10px] font-bold tracking-widest uppercase text-warm-500">
                  revoked {fmtDate(k.revoked_at!)}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}
