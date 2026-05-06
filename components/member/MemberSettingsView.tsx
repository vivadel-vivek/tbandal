"use client";

import Link from "next/link";
import { TEAS, teaUrl } from "@/lib/data";
import type { FlavorMode, MemberSettings as Settings } from "@/lib/types";
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

export function MemberSettingsView() {
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
            sub="Vivek and James occasionally have spare grams of teas they're reviewing."
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
            sub="On tea detail pages, show Vivek + James + Members at once instead of one tab at a time."
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

        {/* ACCOUNT */}
        <SettingsCard title="Account" eyebrow="Sign-out & data">
          <div className="flex gap-2.5 flex-wrap">
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
