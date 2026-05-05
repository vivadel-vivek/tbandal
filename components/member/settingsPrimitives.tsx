"use client";

import type { CSSProperties, ReactNode } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";

export const settingsInput: CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  fontFamily: "var(--font-sans)",
  fontSize: 14,
  background: "var(--bg-subtle)",
  border: "1px solid var(--warm-200, #D4D0CC)",
  borderRadius: 12,
  color: "var(--fg-1)",
  outline: "none",
};

export function SettingsCard({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow: string;
  children: ReactNode;
}) {
  return (
    <section className="card-surface p-7 mb-5">
      <div className="mb-4 pb-3.5 border-b border-warm-200">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="font-display text-burgundy font-medium tracking-tight m-0 mt-1.5 text-hero-sm">
          {title}
        </h2>
      </div>
      <div className="flex flex-col gap-4.5">{children}</div>
    </section>
  );
}

export function SettingsField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="block font-sans text-xs font-bold text-forest mb-1 tracking-wide">
        {label}
      </label>
      {hint && (
        <div className="text-xs text-warm-600 m-0 mb-2 leading-normal">
          {hint}
        </div>
      )}
      {children}
    </div>
  );
}

export function SettingsToggle({
  label,
  sub,
  value,
  onChange,
}: {
  label: string;
  sub?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex gap-3.5 items-start cursor-pointer">
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 w-4 h-4 cursor-pointer accent-burgundy"
      />
      <div className="flex-1">
        <div className="font-sans text-sm font-semibold text-forest">{label}</div>
        {sub && (
          <div className="text-xs text-warm-600 mt-0.5 leading-normal">{sub}</div>
        )}
      </div>
    </label>
  );
}

export function RadioCardGroup<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; title: string; sub?: string }[];
}) {
  return (
    <div className="flex flex-col gap-2">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={active}
            className={[
              "text-left px-3.5 py-3 rounded-md cursor-pointer font-sans flex items-start gap-2.5",
              active
                ? "border-2 border-burgundy bg-burgundy-muted"
                : "border border-warm-300 bg-transparent",
            ].join(" ")}
          >
            <span
              aria-hidden
              className={[
                "w-4 h-4 rounded-full shrink-0 mt-0.5 box-border",
                active
                  ? "border-[5px] border-burgundy bg-cream"
                  : "border-2 border-warm-300 bg-transparent",
              ].join(" ")}
            />
            <span className="flex-1">
              <span className="block font-bold text-sm text-forest">
                {o.title}
              </span>
              {o.sub && (
                <span className="block text-xs text-warm-600 mt-0.5 leading-normal">
                  {o.sub}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
