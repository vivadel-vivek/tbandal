"use client";

// Compact share-control dropdown for a member's saved session. Lives
// in the "you" review tab of TeaDetailView. Click to open a panel
// that lets the user enable/disable a public share link, copy it, or
// rotate the token.

import { useEffect, useRef, useState, useTransition } from "react";
import { useMember } from "@/contexts/MemberContext";
import { setSessionShare } from "@/app/actions/session-share";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type ShareState =
  | { kind: "loading" }
  | { kind: "no-session" }
  | { kind: "ready"; enabled: boolean; token: string | null };

export function SessionShareButton({ teaSlug }: { teaSlug: string }) {
  const { findUserTeaBySlug } = useMember();
  const userTea = findUserTeaBySlug(teaSlug);
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<ShareState>({ kind: "loading" });
  const [pending, startTransition] = useTransition();
  const [copyHint, setCopyHint] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // Outside-click + Escape close.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // Lazy-load the current share state when the panel opens. Avoids a
  // session round-trip on the tea page until the user actually wants
  // to share. RLS lets the owner read their own session.
  useEffect(() => {
    if (!open) return;
    if (!userTea?.id) {
      setState({ kind: "no-session" });
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const sb = createSupabaseBrowserClient();
        const { data } = await sb
          .from("sessions")
          .select("share_enabled, share_token")
          .eq("user_tea_id", userTea.id)
          .maybeSingle();
        if (cancelled) return;
        if (!data) {
          setState({ kind: "no-session" });
        } else {
          setState({
            kind: "ready",
            enabled: data.share_enabled,
            token: data.share_token,
          });
        }
      } catch {
        if (!cancelled) setState({ kind: "no-session" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, userTea?.id]);

  const url =
    state.kind === "ready" && state.token
      ? `${typeof window !== "undefined" ? window.location.origin : ""}/s/${state.token}`
      : "";

  const onToggle = (next: boolean) => {
    if (!userTea?.id) return;
    startTransition(async () => {
      const r = await setSessionShare({ userTeaId: userTea.id, enabled: next });
      if (r.ok) {
        setState((cur) =>
          cur.kind === "ready"
            ? { ...cur, enabled: next, token: r.token ?? cur.token }
            : { kind: "ready", enabled: next, token: r.token },
        );
      }
    });
  };

  const onRotate = () => {
    if (!userTea?.id) return;
    startTransition(async () => {
      const r = await setSessionShare({ userTeaId: userTea.id, enabled: true, rotate: true });
      if (r.ok && r.token) {
        setState({ kind: "ready", enabled: true, token: r.token });
      }
    });
  };

  const onCopy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopyHint("Copied");
      setTimeout(() => setCopyHint(null), 1500);
    } catch {
      setCopyHint("Copy failed");
    }
  };

  return (
    <div ref={wrapRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="bg-transparent border-0 text-burgundy font-bold cursor-pointer text-[13px] no-underline"
      >
        Share →
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Share session"
          className="absolute z-30 right-0 top-[calc(100%+6px)] w-[min(92vw,300px)] bg-[var(--bg-elevated)] border border-warm-200 rounded-lg shadow-elevated p-4"
        >
          <div className="text-[10px] tracking-widest uppercase font-bold text-warm-600 mb-2">
            Share this session
          </div>

          {state.kind === "loading" && (
            <p className="text-[12px] text-warm-700">Loading…</p>
          )}

          {state.kind === "no-session" && (
            <p className="text-[12px] text-warm-700 leading-snug">
              Save a rating first — there&apos;s no session to share yet.
            </p>
          )}

          {state.kind === "ready" && (
            <>
              <p className="text-[12px] text-warm-700 leading-snug mb-3">
                When enabled, anyone with the link can view this session.
                You can revoke or rotate the link at any time.
              </p>

              <label className="inline-flex items-center gap-2 text-[12px] font-bold text-warm-700 mb-3">
                <input
                  type="checkbox"
                  checked={state.enabled}
                  onChange={(e) => onToggle(e.target.checked)}
                  disabled={pending}
                />
                Public link enabled
              </label>

              {state.enabled && state.token && (
                <div className="space-y-2">
                  <input
                    type="text"
                    readOnly
                    value={url}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    className="w-full px-2 py-1.5 rounded-md border border-warm-300 bg-cream text-[11px] font-mono"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={onCopy}
                      className="flex-1 px-3 py-1.5 rounded-pill bg-burgundy text-cream text-[11px] font-bold tracking-widest uppercase"
                    >
                      {copyHint ?? "Copy link"}
                    </button>
                    <button
                      type="button"
                      onClick={onRotate}
                      disabled={pending}
                      className="px-3 py-1.5 rounded-pill border border-warm-300 text-warm-700 text-[11px] font-bold tracking-widest uppercase disabled:opacity-60"
                      title="Replace the token, breaking any old links"
                    >
                      Rotate
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
