// "Are you new here?" — guided brewing flow. Anonymous-friendly: pick
// a tea + gear + style, get a recipe + live timer, save the session
// (which prompts signup if not authed).

import type { Metadata } from "next";
import { getTeas } from "@/lib/content";
import { GuidedBrew } from "@/components/start/GuidedBrew";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Start brewing",
  description:
    "Pick a tea, pick your gear, pick the kind of cup you want — and we'll walk you through brewing it. New to tea? Start here.",
  alternates: { canonical: "/start" },
};

export default async function StartPage() {
  const teas = await getTeas();
  return (
    <main>
      <GuidedBrew teas={teas} />
    </main>
  );
}
