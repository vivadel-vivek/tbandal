// Server component — entire home page is static editorial except the
// "Recently brewed" tea grid, which is a client island consuming
// member + tweaks contexts.

import Link from "next/link";
import {
  CONTRIBUTORS,
  POSTS,
  TEAS,
  VENDORS,
  featuredTea,
  latestPost,
} from "@/lib/data";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { Stat } from "@/components/ui/Stat";
import { TeaStain } from "@/components/ui/TeaStain";
import { AvatarChip } from "@/components/ui/AvatarChip";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { RecentlyBrewedGrid } from "@/components/home/RecentlyBrewedGrid";
import type { Post } from "@/lib/types";

export default function Home() {
  const featured = featuredTea();
  const recent = TEAS.slice(1, 4);
  const featuredPost = latestPost();
  const morePosts = POSTS.slice(1, 4);

  return (
    <main>
      {/* ============ HERO ============ */}
      <section className="relative pt-18 pb-14 overflow-hidden">
        <TeaStain
          size={420}
          color="#C4A35A"
          opacity={0.15}
          className="absolute -top-20 -right-24 pointer-events-none"
        />
        <TeaStain
          size={260}
          color="#722F37"
          opacity={0.08}
          className="absolute -bottom-10 -left-16 pointer-events-none"
        />
        <Container>
          <div className="grid grid-cols-[1.2fr_1fr] gap-14 items-center">
            <div>
              <Eyebrow>A two-person tea journal · est. 2024</Eyebrow>
              <h1 className="font-display text-burgundy font-medium tracking-tightest leading-tighter mt-4 mb-5 text-hero-2xl text-balance">
                <span className="italic">Two buds,</span>
                <br /> a leaf, and a long
                <br /> afternoon to brew it.
              </h1>
              <p className="text-lg text-warm-700 max-w-[540px] leading-relaxed mb-7">
                Vivek and James review tea — single-origin, vendor-sourced, and
                everything between. Twelve flavor axes, dual ratings, and
                brewing parameters that actually got the cup we describe.
              </p>
              <div className="flex gap-3">
                <Link href="/discover/teas">
                  <Button variant="primary" size="lg">
                    Browse the library
                  </Button>
                </Link>
                <Link href="/recommendations">
                  <Button variant="secondary" size="lg">
                    Discover by flavor
                  </Button>
                </Link>
              </div>
              <div className="flex gap-8 mt-10 pt-6 border-t border-warm-200">
                <Stat n={TEAS.length + 38} label="Teas reviewed" />
                <Stat n={POSTS.length + 24} label="Tasting essays" />
                <Stat n={VENDORS.length + 9} label="Vendors covered" />
              </div>
            </div>

            {/* Featured tea card — "today's pour" */}
            <div className="relative">
              <Link
                href={`/tea/${featured.slug}`}
                className="block no-underline relative rounded-2xl shadow-elevated overflow-hidden aspect-[4/5]"
                style={{ background: featured.gradient }}
              >
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.45) 100%)",
                  }}
                />
                <div className="absolute left-7 right-7 bottom-6 text-cream">
                  <Eyebrow color="rgba(250,247,242,0.8)">
                    Today&apos;s pour · {featured.region}
                  </Eyebrow>
                  <h3 className="font-display italic text-cream font-medium leading-tight tracking-tight my-1.5 text-hero-md">
                    {featured.name}
                  </h3>
                  <p className="text-[13px] m-0" style={{ color: "rgba(250,247,242,0.85)" }}>
                    {featured.year} · {featured.elev}m
                  </p>
                </div>
                <span className="absolute top-5 right-5 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-pill font-sans text-xs font-bold text-burgundy bg-cream-glass-strong">
                  Read review →
                </span>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* ============ RECENTLY BREWED ============ */}
      <section className="py-10">
        <Container>
          <SectionHeader
            eyebrow="Recently brewed"
            title="What's been in the gaiwan"
            link="See all →"
            href="/discover/teas"
          />
          <RecentlyBrewedGrid teas={recent} />
        </Container>
      </section>

      {/* ============ TWO CONTRIBUTORS ============ */}
      <section className="py-14 bg-cream">
        <Container>
          <SectionHeader
            eyebrow="Two palates"
            title="Different mouths, one cup"
            link="About us →"
            href="/about"
          />
          <div className="grid grid-cols-2 gap-6">
            {[CONTRIBUTORS.vivek, CONTRIBUTORS.james].map((c) => (
              <article
                key={c.key}
                className="bg-white rounded-xl p-7 shadow-card border border-warm-200 flex gap-5"
              >
                <AvatarChip who={c.key} size={64} />
                <div>
                  <h3 className="font-display italic text-burgundy font-medium m-0 mb-1 text-hero-sm">
                    {c.name}
                  </h3>
                  <Eyebrow color="var(--warm-500, #857F79)">{c.palate}</Eyebrow>
                  <p className="text-sm text-warm-700 leading-relaxed mt-2.5 m-0">
                    {c.bio}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* ============ FROM THE JOURNAL ============ */}
      <section className="py-14">
        <Container>
          <SectionHeader
            eyebrow="From the journal"
            title="Brewing notes & long reads"
            link="All posts →"
            href="/journal"
          />
          <div className="grid grid-cols-[1.4fr_1fr] gap-6">
            <FeaturedPost post={featuredPost} />
            <div className="flex flex-col gap-4">
              {morePosts.map((p) => (
                <PostMini key={p.slug} post={p} />
              ))}
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}

function FeaturedPost({ post }: { post: Post }) {
  return (
    <Link
      href={`/journal/${post.slug}`}
      className="group block no-underline card-surface card-surface-hover overflow-hidden"
    >
      <div
        className="aspect-[16/8]"
        style={{ background: post.grad }}
      />
      <div className="px-7 pt-6 pb-7">
        <Eyebrow color="var(--sage-dark, #6B7A5D)">
          {post.cat} · {post.readTime} min
        </Eyebrow>
        <h3 className="font-display text-burgundy font-medium leading-tight tracking-tight mt-2 mb-2.5 text-hero-md">
          {post.title}
        </h3>
        <p className="text-[15px] text-warm-700 leading-relaxed m-0 mb-3.5">
          {post.excerpt}
        </p>
        <div className="flex items-center gap-2.5">
          <AvatarChip
            who={post.author.toLowerCase() as "vivek" | "james"}
            size={24}
          />
          <span className="text-xs text-warm-600">
            {post.author} · {post.date}
          </span>
        </div>
      </div>
    </Link>
  );
}

function PostMini({ post }: { post: Post }) {
  return (
    <Link
      href={`/journal/${post.slug}`}
      className="group flex no-underline bg-white rounded-lg shadow-card border border-warm-200 px-5 py-4 gap-3.5 items-center transition-colors hover:bg-cream"
    >
      <div
        className="w-16 h-16 rounded-md shrink-0"
        style={{ background: post.grad }}
      />
      <div>
        <Eyebrow color="var(--sage-dark, #6B7A5D)" className="text-[9px]">
          {post.cat}
        </Eyebrow>
        <h4 className="font-display text-burgundy font-medium leading-snug m-0 mt-1 mb-1 text-[19px]">
          {post.title}
        </h4>
        <span className="text-[11px] text-warm-500">
          {post.author} · {post.date}
        </span>
      </div>
    </Link>
  );
}
