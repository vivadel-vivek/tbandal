"use client";

import Link from "next/link";
import { teaUrl } from "@/lib/tea-helpers";
import type { FlavorMode, MemberSettings as Settings, Tea } from "@/lib/types";
import { useMember } from "@/contexts/MemberContext";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import {
  RadioCardGroup,
  SettingsCard,
  SettingsField,
  SettingsToggle,
  settingsInput,
} from "./settingsPrimitives";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { ApiKeysPanel } from "@/components/member/ApiKeysPanel";
import { useState } from "react";

type Consent = {
  privacyVersion: string | null;
  privacyAcceptedAt: string | null;
  termsVersion: string | null;
  termsAcceptedAt: string | null;
};

type ApiKeyRow = {
  id: string;
  name: string;
  prefix: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
};

type Props = {
  /** Catalog teas, passed from the server parent. Used to resolve the
   *  member's "tasted" slug list back to display names + URLs. */
  teas: Tea[];
  /** Current avatar URL from the profiles row (server-loaded). */
  avatarUrl: string | null;
  /** Policy acceptance audit (server-loaded). */
  consent: Consent;
  /** Role string from profiles (admin/contributor/vendor/member/user)
   *  or null for guests. Gates the API-keys panel. */
  role: string | null;
  /** API keys belonging to the current user, server-loaded. Only
   *  populated for staff (admin/contributor). */
  apiKeys: ApiKeyRow[];
};

export function MemberSettingsView({
  teas: TEAS,
  avatarUrl,
  consent,
  role,
  apiKeys,
}: Props) {
  const isStaff = role === "admin" || role === "contributor";
  const { member, setMember, reblind } = useMember();
  const s = member.settings;

  const setSetting = <K extends keyof Settings>(key: K, val: Settings[K]) =>
    setMember((m) => ({ ...m, settings: { ...m.settings, [key]: val } }));

  const setNotif = (key: keyof Settings["notifications"], val: boolean) =>
    setMember((m) => ({
      ...m,
      settings: {
        ...m.settings,
        notifications: { ...m.settings.notifications, [key]: val },
      },
    }));

  const tasted = (s.tastedTeas ?? [])
    .map((slug) => TEAS.find((t) => t.slug === slug))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));
  const blindCount = tasted.length;

  return (
    <main>
      <Container size="article">
        <Link href="/member" className="back-link mt-8 mb-2">
          ← Back to your profile
        </Link>

        <div className="pt-2 pb-8">
          <Eyebrow>Member · Settings</Eyebrow>
          <h1 className="font-display text-burgundy font-medium tracking-tight leading-hero mt-2 mb-3 text-[36px] sm:text-[56px]">
            <span className="italic">Your settings.</span>
          </h1>
          <p className="text-[15px] text-warm-700 leading-relaxed max-w-[620px] m-0">
            How the site looks to you, what arrives in your inbox, and the
            names you go by here.
          </p>
        </div>

        {/* IDENTITY */}
        <SettingsCard title="Identity" eyebrow="Who you are">
          <SettingsField
            label="Profile photo"
            hint="A square photo, ideally face-forward. Replaces the colored letter chip in the header and on your reviews."
          >
            <AvatarPickerField initial={avatarUrl} />
          </SettingsField>
          <SettingsField
            label="Display name"
            hint="Shown next to your reviews and journal entries."
          >
            <input
              type="text"
              value={s.displayName}
              onChange={(e) => setSetting("displayName", e.target.value)}
              placeholder={member.name || "You"}
              style={settingsInput}
            />
          </SettingsField>
          <SettingsField
            label="Email"
            hint="Used for sign-in and notifications. We never share it."
          >
            <input
              type="email"
              value={s.email}
              onChange={(e) => setSetting("email", e.target.value)}
              placeholder="you@example.com"
              style={settingsInput}
            />
          </SettingsField>
          <SettingsField
            label="Contributor handle"
            hint="Optional — leave blank unless you've been invited as a contributor."
          >
            <input
              type="text"
              value={s.contributorHandle}
              onChange={(e) => setSetting("contributorHandle", e.target.value)}
              placeholder="e.g. @kira"
              style={settingsInput}
            />
          </SettingsField>
        </SettingsCard>

        {/* NOTIFICATIONS */}
        <SettingsCard title="Notifications" eyebrow="What lands in your inbox">
          <SettingsToggle
            label="Weekly digest"
            sub="Friday roundup of new reviews and journal entries."
            value={s.notifications.weeklyDigest}
            onChange={(v) => setNotif("weeklyDigest", v)}
          />
          <SettingsToggle
            label="New tea alerts"
            sub="When a tea you might like (based on your palate) gets reviewed."
            value={s.notifications.newTeas}
            onChange={(v) => setNotif("newTeas", v)}
          />
          <SettingsToggle
            label="Sample-send opportunities"
            sub="James and Vivek occasionally have spare grams of teas they're reviewing."
            value={s.notifications.sampleRequests}
            onChange={(v) => setNotif("sampleRequests", v)}
          />
          <SettingsToggle
            label="Replies to your reviews"
            sub="When another member or contributor responds."
            value={s.notifications.replies}
            onChange={(v) => setNotif("replies", v)}
          />
        </SettingsCard>

        {/* DISPLAY */}
        <SettingsCard title="Display options" eyebrow="How the site looks to you">
          <SettingsField
            label="Radar mode"
            hint="How flavor profiles are shown to you across the site."
          >
            <RadioCardGroup<FlavorMode>
              value={s.flavorMode}
              onChange={(v) => setSetting("flavorMode", v)}
              options={[
                { value: "blind",    title: "Blind",    sub: "Hide reviews & ratings until you've tasted." },
                { value: "basic",    title: "Simple",   sub: "Six lay-term axes on a 5-point scale — gentlest entry." },
                { value: "advanced", title: "Advanced", sub: "Twelve sommelier axes on a 10-point scale." },
              ]}
            />
          </SettingsField>
          <SettingsToggle
            label="Show all radars overlaid by default"
            sub="On tea detail pages, show James + Vivek + Members at once instead of one tab at a time."
            value={s.composite}
            onChange={(v) => setSetting("composite", v)}
          />
          <SettingsField
            label="Theme"
            hint="Override the site's background. Auto follows whatever the site default is."
          >
            <RadioCardGroup<Settings["theme"]>
              value={s.theme}
              onChange={(v) => setSetting("theme", v)}
              options={[
                { value: "auto",      title: "Auto",      sub: "Follow site default." },
                { value: "parchment", title: "Parchment", sub: "Warm off-white, our default." },
                { value: "cream",     title: "Cream",     sub: "A touch lighter, easier on bright screens." },
                { value: "dark",      title: "Dark",      sub: "Burgundy on near-black for late sessions." },
              ]}
            />
          </SettingsField>
        </SettingsCard>

        {/* UNBLINDED TEAS */}
        {(s.flavorMode === "blind" || blindCount > 0) && (
          <SettingsCard
            title="Un-blinded teas"
            eyebrow={`${blindCount} ${blindCount === 1 ? "tea" : "teas"} you've revealed`}
          >
            <p className="text-[13px] text-warm-600 leading-relaxed m-0 mb-4">
              In Blind mode we hide reviews until you tap &ldquo;I&apos;ve
              tasted this.&rdquo; These teas are no longer hidden for you.
              Re-blind any of them if you&apos;d like to be surprised again.
            </p>
            {tasted.length === 0 ? (
              <div className="p-4 bg-cream rounded-md text-[13px] text-warm-700">
                Nothing un-blinded yet. As you reveal teas in Blind mode
                they&apos;ll appear here.
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {tasted.map((t) => (
                  <div
                    key={t.slug}
                    className="flex items-center gap-3 px-3 py-2 rounded-md bg-cream"
                  >
                    <div
                      className="w-8 h-8 rounded-sm shrink-0"
                      style={{ background: t.gradient }}
                    />
                    <div className="flex-1 min-w-0">
                      <Link
                        href={teaUrl(t)}
                        className="block bg-transparent border-0 p-0 text-left no-underline"
                      >
                        <div className="font-display text-burgundy text-base font-medium">
                          {t.name}
                        </div>
                        <div className="text-[11px] text-warm-600">
                          {t.region}
                        </div>
                      </Link>
                    </div>
                    <button
                      type="button"
                      onClick={() => reblind(t.slug)}
                      className="bg-transparent border border-warm-300 px-3 py-1 rounded-pill font-sans text-[11px] font-bold text-warm-700 cursor-pointer tracking-wide"
                    >
                      Re-blind
                    </button>
                  </div>
                ))}
              </div>
            )}
          </SettingsCard>
        )}

        {/* API KEYS — staff-only panel for CLI publishing. */}
        {isStaff && (
          <SettingsCard
            title="API keys"
            eyebrow="CLI publishing"
          >
            <p className="text-[12px] text-warm-700 leading-snug m-0 mb-3">
              Keys authenticate <code className="font-mono">POST</code>{" "}
              requests to <code className="font-mono">/api/v1/teas</code>{" "}
              and <code className="font-mono">/api/v1/posts</code>. Send
              the raw key as{" "}
              <code className="font-mono">Authorization: Bearer …</code>.
              Examples and request shapes are in{" "}
              <a
                href="/docs/how-to/admins.md"
                className="text-burgundy underline"
              >
                docs/how-to/admins.md
              </a>{" "}
              (or in the repo if you&apos;re viewing this on the live
              site).
            </p>
            <ApiKeysPanel initial={apiKeys} />
          </SettingsCard>
        )}

        {/* POLICY ACCEPTANCE — audit trail of what you've agreed to. */}
        <SettingsCard title="Policy acceptance" eyebrow="Privacy & terms">
          <ConsentRow
            doc="Privacy policy"
            href="/privacy"
            version={consent.privacyVersion}
            acceptedAt={consent.privacyAcceptedAt}
          />
          <ConsentRow
            doc="Terms of use"
            href="/terms"
            version={consent.termsVersion}
            acceptedAt={consent.termsAcceptedAt}
          />
          <p className="text-[11px] text-warm-600 leading-snug mt-3 m-0">
            We record the version you accepted at signup. If we materially
            change either document we&apos;ll email you and ask you to
            re-accept the new version before your next sign-in.
          </p>
        </SettingsCard>

        {/* ACCOUNT */}
        <SettingsCard title="Account" eyebrow="Sign-out & data">
          <p className="text-[12px] text-warm-700 leading-snug m-0 mb-3">
            Export a JSON dump of everything we hold for you — profile,
            library, sessions, ratings, consent log, API key metadata.
            GDPR Art. 20 portability; useful for a personal backup too.
          </p>
          <div className="flex gap-2.5 flex-wrap">
            <a
              href="/api/me/export"
              download
              className="inline-flex items-center px-4 py-2 rounded-pill bg-burgundy text-cream text-[12px] font-bold tracking-widest uppercase no-underline cursor-pointer hover:bg-burgundy-dark"
            >
              Export my data
            </a>
            <Button
              variant="secondary"
              onClick={() => alert("Sign-out is wired up in Phase 6 (auth).")}
            >
              Sign out
            </Button>
            <Button
              variant="ghost"
              style={{ color: "var(--burgundy)" }}
              onClick={() =>
                alert("Account deletion lands with the backend.")
              }
            >
              Delete account…
            </Button>
          </div>
        </SettingsCard>

        <div className="py-8 text-center text-xs text-warm-600">
          Settings save automatically as you change them.
        </div>
      </Container>
    </main>
  );
}

// Single row in the policy-acceptance card — shows the document name
// (linked), the version they accepted, and when. Falls back to a
// "not recorded" line for accounts created before consent capture
// landed (e.g. James + Vivek's seeded admin accounts).
function ConsentRow({
  doc,
  href,
  version,
  acceptedAt,
}: {
  doc: string;
  href: string;
  version: string | null;
  acceptedAt: string | null;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-2 border-b border-warm-200 last:border-b-0 text-[13px]">
      <a
        href={href}
        target="_blank"
        rel="noopener"
        className="text-burgundy underline font-bold no-underline hover:underline"
      >
        {doc}
      </a>
      {version && acceptedAt ? (
        <span className="text-warm-700 font-mono text-[12px] tabular-nums">
          v{version} · accepted{" "}
          {new Date(acceptedAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      ) : (
        <span className="text-warm-500 italic text-[12px]">not recorded</span>
      )}
    </div>
  );
}

// Wrapper that holds the avatar URL in local state so the preview
// updates immediately after a successful upload — the server action
// also writes to the profiles row + revalidates, so a hard refresh
// shows the same photo. We don't render anything if the user is a
// guest (avatarUrl=null AND can't upload because no auth).
function AvatarPickerField({ initial }: { initial: string | null }) {
  const [url, setUrl] = useState<string | null>(initial);
  return (
    <div className="max-w-[280px]">
      <ImageUpload
        value={url}
        onChange={setUrl}
        kind="avatar"
        avatarTarget="self"
        aspectRatio="1/1"
        alt="Your profile photo"
      />
    </div>
  );
}
